from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
from playwright.sync_api import sync_playwright, expect
import json
import os
import shutil

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = Path(os.environ.get("SCP_SMOKE_OUTPUT", ROOT / "test-results" / "smoke"))
OUT.mkdir(parents=True, exist_ok=True)
results = []
errors = []
placement = {}


@contextmanager
def serve_build():
    if not (DIST / "game.js").is_file():
        raise RuntimeError("Le build est absent. Exécutez npm run build avant ce test.")

    class QuietHandler(SimpleHTTPRequestHandler):
        extensions_map = {
            **SimpleHTTPRequestHandler.extensions_map,
            ".webmanifest": "application/manifest+json",
        }

        def log_message(self, format, *args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(DIST)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def step(name, fn):
    try:
        fn()
        results.append({"step": name, "ok": True})
    except Exception as exc:
        results.append({"step": name, "ok": False, "error": str(exc)})
        raise


def run():
    with serve_build() as base_url, TemporaryDirectory(prefix="scp-smoke-profile-") as profile, sync_playwright() as p:
        launch_options = {
            "headless": True,
            "args": ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--mute-audio"],
            "viewport": {"width": 1600, "height": 1000},
            "device_scale_factor": 1,
        }
        executable = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
        if not executable and not Path(p.chromium.executable_path).is_file():
            executable = shutil.which("chromium") or shutil.which("chromium-browser")
        if executable:
            launch_options["executable_path"] = executable

        def open_browser():
            browser_context = p.chromium.launch_persistent_context(profile, **launch_options)
            active_page = browser_context.pages[0] if browser_context.pages else browser_context.new_page()
            active_page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
            active_page.on("console", lambda msg: errors.append(f"console.{msg.type}: {msg.text}") if msg.type in ("error", "warning") else None)
            return browser_context, active_page

        context = None
        page = None
        try:
            context, page = open_browser()
            step("chargement", lambda: page.goto(base_url, wait_until="load"))
            page.wait_for_timeout(700)
            expect(page.locator("#start-screen")).to_be_visible()
            expect(page.locator("h1")).to_contain_text("SCP FOUNDATION")
            page.screenshot(path=str(OUT / "start.png"), full_page=True)

            def new_game():
                page.locator('button[data-action="new-game"]').first.click()
                expect(page.locator("#modal-root")).to_be_visible()
                expect(page.locator("#new-mode")).to_be_visible()
                page.select_option("#new-mode", "sandbox")
                page.select_option("#new-difficulty", "standard")
                page.locator('button[data-action="confirm-new-game"]').click()
                expect(page.locator("#start-screen")).to_be_hidden()
                expect(page.locator("#right-panel")).to_contain_text("Région")
            step("nouvelle partie", new_game)
            page.wait_for_timeout(350)
            page.screenshot(path=str(OUT / "region.png"), full_page=True)

            def place_first(layer, nav_view, shot):
                page.locator(f'button[data-view="{nav_view}"]').click()
                page.wait_for_timeout(250)
                build_buttons = page.locator('#right-panel button.build-item:not([disabled])')
                expect(build_buttons.first).to_be_visible()
                funds_before = page.locator("#funds-display").inner_text()
                build_buttons.first.click()
                canvas = page.locator("#game-canvas")
                box = canvas.bounding_box()
                assert box is not None
                width, height = box["width"], box["height"]
                if layer == "region":
                    tile_w = max(26, min(54, width / 15))
                    tile_h = tile_w * 0.48
                    grid_x, grid_y = 17, 12
                    local_x = width * 0.5 + (grid_x - grid_y) * tile_w * 0.5 + tile_w * 0.12
                    local_y = 54 + (grid_x + grid_y) * tile_h * 0.5 + tile_h * 0.38
                elif layer == "surface":
                    cell = max(18, min(38, min(width / 28, (height - 80) / 19)))
                    origin_x = (width - 26 * cell) / 2
                    origin_y = 62
                    grid_x, grid_y = 21, 1
                    local_x = origin_x + (grid_x + 0.5) * cell
                    local_y = origin_y + (grid_y + 0.5) * cell
                else:
                    cell_w = max(24, min(48, width / 24))
                    level_h = max(48, min(74, (height - 100) / 10))
                    origin_x = (width - 22 * cell_w) / 2
                    origin_y = 72
                    grid_x, grid_y = 0, 3
                    local_x = origin_x + (grid_x + 0.5) * cell_w
                    local_y = origin_y + (grid_y + 0.5) * level_h
                canvas.click(position={"x": local_x, "y": local_y})
                page.wait_for_timeout(180)
                toast = page.locator("#toast")
                classes = toast.get_attribute("class") or ""
                success = "success" in classes
                if not success:
                    raise AssertionError(f"Construction {layer} non validée: {toast.inner_text()}")
                page.screenshot(path=str(OUT / shot), full_page=True)
                return {"funds_before": funds_before, "funds_after": page.locator("#funds-display").inner_text(), "placed": success}

            step("construction région", lambda: placement.update(region=place_first("region", "region", "region-built.png")))
            step("vue et construction surface", lambda: placement.update(surface=place_first("surface", "surface", "surface.png")))
            expect(page.locator("#right-panel")).to_contain_text("Construction")
            step("vue et construction sous-sol", lambda: placement.update(underground=place_first("underground", "underground", "underground.png")))
            expect(page.locator("#right-panel")).to_contain_text("Confinement")

            def transfer_scp():
                # Cancel the construction cursor, then select the initial Safe containment room at x=2..4, level 0.
                cancel = page.locator('#right-panel button[data-action="cancel-build"]')
                if cancel.count():
                    cancel.click()
                canvas = page.locator("#game-canvas")
                box = canvas.bounding_box()
                assert box is not None
                width, height = box["width"], box["height"]
                cell_w = max(24, min(48, width / 24))
                level_h = max(48, min(74, (height - 100) / 10))
                origin_x = (width - 22 * cell_w) / 2
                origin_y = 72
                canvas.click(position={"x": origin_x + 3.2 * cell_w, "y": origin_y + 0.5 * level_h})
                page.wait_for_timeout(180)
                transfer = page.locator('#right-panel button[data-action="transfer-scp"]').first
                expect(transfer).to_be_visible()
                transfer.click()
                expect(page.locator("#toast")).to_contain_text("confiné")
                page.screenshot(path=str(OUT / "scp-contained.png"), full_page=True)

            step("transfert d’un SCP vers une cellule compatible", transfer_scp)

            def management():
                page.locator('button[data-view="management"]').click()
                page.wait_for_timeout(200)
                expect(page.locator("#management-overlay")).to_be_visible()
                expect(page.locator("#management-overlay")).to_contain_text("Site Deep Protocol")
                page.locator('button[data-action="management-tab"][data-tab="staff"]').click()
                expect(page.locator("#management-overlay")).to_contain_text("Personnel")
                # Hire a role to validate a state-changing management action.
                hire = page.locator('#management-overlay button[data-action="hire-staff"]').first
                if hire.is_enabled():
                    hire.click()
                page.locator('button[data-action="management-tab"][data-tab="research"]').click()
                expect(page.locator("#management-overlay")).to_contain_text("Recherche")
                research = page.locator('#management-overlay button[data-action="research"]:not([disabled])').first
                if research.count() and research.is_enabled():
                    research.click()
                page.locator('button[data-action="management-tab"][data-tab="scps"]').click()
                expect(page.locator("#management-overlay")).to_contain_text("Dossiers SCP")
                procedure = page.locator('#management-overlay button[data-action="open-procedure"]').first
                expect(procedure).to_be_visible()
                procedure.click()
                expect(page.locator("#modal-root")).to_be_visible()
                expect(page.locator("#modal-root")).to_contain_text("PROCÉDURE")
                slider = page.locator('#modal-root [data-procedure-range]').first
                if slider.count():
                    slider.fill("85")
                page.locator('#modal-root button[data-action="save-procedure"]').click()
                expect(page.locator("#modal-root")).to_be_hidden()
                page.screenshot(path=str(OUT / "management.png"), full_page=True)
            step("gestion, recrutement, recherche et procédure", management)

            def persistence_snapshot():
                # Read the real browser storage. Re-saving after resume also checks the
                # runtime state, rather than merely checking that a JSON string survived.
                return page.evaluate("""() => {
                    const saved = JSON.parse(localStorage.getItem(SCPGame.SAVE_KEY));
                    if (!saved) throw new Error("Sauvegarde native absente");
                    return {
                        seed: saved.seed,
                        mode: saved.mode,
                        resources: saved.resources,
                        elapsedMinutes: saved.elapsedMinutes,
                        regionFacilities: saved.regionFacilities,
                        surfaceRooms: saved.surfaceRooms.map(({staffAssigned, ...room}) => room),
                        undergroundRooms: saved.undergroundRooms.map(({staffAssigned, ...room}) => room),
                        staff: saved.staff.map(member => ({
                            id: member.id, name: member.name, role: member.role,
                            clearance: member.clearance, shift: member.shift,
                            needs: member.needs, position: member.position
                        })),
                        scps: saved.scps,
                        procedures: saved.procedures,
                        research: saved.researchNodes.map(node => ({id: node.id, completed: node.completed})),
                        currentChapter: saved.currentChapter
                    };
                }""")

            def save_from_settings():
                page.locator('button[data-view="management"]').click()
                page.locator('button[data-action="management-tab"][data-tab="settings"]').click()
                expect(page.locator("#management-overlay")).to_contain_text("Sauvegarde")
                page.locator('#management-overlay button[data-action="save"]').click()
                expect(page.locator("#toast")).to_contain_text("Sauvegarde")

            def save_load():
                page.locator('button[data-speed="0"]').click()
                assert page.evaluate("localStorage instanceof Storage"), "Stockage navigateur natif requis"
                save_from_settings()
                page.locator('#management-overlay button[data-action="load"]').click()
                expect(page.locator("#toast")).to_contain_text("chargée")
                save_from_settings()
            step("sauvegarde et chargement", save_load)
            saved_snapshot = persistence_snapshot()

            def resume_and_verify():
                expect(page.locator("#start-screen")).to_be_visible()
                expect(page.locator("#continue-button")).to_be_enabled()
                page.locator("#continue-button").click()
                expect(page.locator("#start-screen")).to_be_hidden()
                save_from_settings()
                assert persistence_snapshot() == saved_snapshot, "La progression a changé pendant la reprise"

            def reload_save():
                page.reload(wait_until="load")
                resume_and_verify()
            step("reprise après rechargement HTTP", reload_save)

            def restart_save():
                nonlocal context, page
                context.close()
                context, page = open_browser()
                page.goto(base_url, wait_until="load")
                resume_and_verify()
                page.screenshot(path=str(OUT / "restart.png"), full_page=True)
            step("reprise après fermeture complète du navigateur", restart_save)

            def offline_save():
                page.evaluate("navigator.serviceWorker.ready.then(() => true)")
                page.wait_for_function("navigator.serviceWorker.controller !== null")
                context.set_offline(True)
                try:
                    page.reload(wait_until="load")
                    resume_and_verify()
                    page.screenshot(path=str(OUT / "offline.png"), full_page=True)
                finally:
                    context.set_offline(False)
            step("reprise hors ligne via le cache PWA", offline_save)

            def crisis():
                page.locator('button[data-view="command"]').click()
                expect(page.locator("#right-panel")).to_contain_text("Exercices contrôlés")
                page.locator('#right-panel button[data-action="start-drill"][data-drill="power"]').click()
                expect(page.locator("#right-panel")).to_contain_text("Ordres disponibles")
                order = page.locator('#right-panel button[data-action="crisis-order"]').first
                expect(order).to_be_visible()
                order.click()
                expect(page.locator("#right-panel")).to_contain_text("Journal de crise")
                page.screenshot(path=str(OUT / "crisis.png"), full_page=True)
            step("mode crise et ordre tactique", crisis)

            # Responsive smoke check.
            def mobile():
                page.set_viewport_size({"width": 430, "height": 932})
                page.wait_for_timeout(250)
                expect(page.locator("#top-bar")).to_be_visible()
                expect(page.locator("#left-nav")).to_be_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Débordement horizontal mobile"
                page.screenshot(path=str(OUT / "mobile.png"), full_page=True)
            step("interface mobile", mobile)

        except Exception as exc:
            if not results or results[-1]["ok"]:
                results.append({"step": "exécution navigateur", "ok": False, "error": str(exc)})
            if page is not None and not page.is_closed():
                try:
                    page.screenshot(path=str(OUT / "failure.png"), full_page=True)
                except Exception:
                    pass
            raise
        finally:
            if context is not None:
                context.close()


try:
    run()
finally:
    report = {
        "ok": bool(results) and all(r["ok"] for r in results) and not errors,
        "steps": results,
        "browser_messages": errors,
        "placement": placement,
        "storage": "native persistent Chromium profile",
    }
    (OUT / "smoke-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
if errors:
    raise SystemExit(2)

