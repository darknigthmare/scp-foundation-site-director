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
access_checks = {}


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
                page.locator(f'#left-nav button[data-view="{nav_view}"]').click()
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
                    grid_x, grid_y = 17, 0
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
                # The previous Surface selection may focus another Y cut.
                # Jump explicitly to the original module's real transverse row.
                cut = page.locator('#right-panel select[data-slice-select]')
                expect(cut).to_be_visible()
                cut.select_option("14")
                expect(page.locator("#right-panel")).to_contain_text("Coupe souterraine Y=14")
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

            def underground_network_panel():
                panel = page.locator("#right-panel")
                expect(panel).to_contain_text("Habilitation")
                expect(panel).to_contain_text("Ascenseur")
                expect(panel).to_contain_text("Galerie")
                seal = panel.locator('button[data-action="toggle-underground-seal"]')
                expect(seal).to_be_visible()
                seal.click()
                expect(panel).to_contain_text("Scellée")
                panel.locator('button[data-action="toggle-underground-seal"]').click()
                expect(panel).to_contain_text("Ouverte")
                page.screenshot(path=str(OUT / "underground-network.png"), full_page=True)
            step("habilitation, liaison et scellement du souterrain", underground_network_panel)

            def physical_utility_circuits():
                panel = page.locator("#right-panel")
                expect(panel).to_contain_text("Réseaux techniques physiques")
                expect(panel).to_contain_text("Électricité")
                expect(panel).to_contain_text("Ventilation")
                water = panel.locator('.underground-utilities button[data-action="underground-conduit-toggle"][data-kind="water"]').first
                expect(water).to_be_visible()
                expect(water).to_have_attribute("aria-pressed", "true")
                water.click()
                expect(water).to_have_attribute("aria-pressed", "false")
                expect(panel).to_contain_text("Eau : Coupée")
                page.screenshot(path=str(OUT / "underground-utility-water-cut.png"), full_page=True)
                water.click()
                expect(water).to_have_attribute("aria-pressed", "true")
                expect(panel).to_contain_text("Eau : Distribuée")
                page.screenshot(path=str(OUT / "underground-utilities.png"), full_page=True)
            step("réseaux physiques du sous-sol, coupure et remise en eau", physical_utility_circuits)

            def underground_gate_ui():
                panel = page.locator("#right-panel")
                expect(panel).to_contain_text("Portes et sas souterrains")
                install = panel.locator('button[data-action="add-underground-airlock"]').first
                expect(install).to_be_visible()
                install.click()
                gate = panel.locator('.underground-gate-row:has(button[data-action="underground-gate-lock"])').first
                expect(gate).to_contain_text("Sas")
                expect(gate).to_contain_text("habilitation")
                gate.locator('button[data-action="underground-gate-lock"]').click()
                expect(gate).to_contain_text("Verrouillé")
                gate.locator('button[data-action="underground-gate-lock"]').click()
                expect(gate).to_contain_text("disponible")
                gate.locator('button[data-action="underground-gate-direction"]').click()
                expect(gate).to_contain_text("Sens :")
                gate.locator('button[data-action="underground-gate-power"]').click()
                expect(gate).to_contain_text("Panne électrique")
                gate.locator('button[data-action="underground-gate-power"]').click()
                expect(gate).to_contain_text("disponible")
                page.screenshot(path=str(OUT / "underground-airlock.png"), full_page=True)
            step("sas souterrain réel : installation, verrouillage, sens et alimentation", underground_gate_ui)

            def coherent_three_views():
                panel = page.locator("#right-panel")
                expect(panel).to_contain_text("À l'aplomb")
                expect(panel).to_contain_text("Coupe")
                page.screenshot(path=str(OUT / "site-section.png"), full_page=True)
                panel.locator('button[data-view="surface"]').click()
                expect(panel).to_contain_text("Voir ce bâtiment dans la ville")
                page.screenshot(path=str(OUT / "site-interior.png"), full_page=True)
                panel.locator('button[data-view="region"]').click()
                expect(panel).to_contain_text("Toiture du bâtiment principal")
                page.screenshot(path=str(OUT / "site-roof.png"), full_page=True)
                # Click a different specific roof in the projected exterior plan.
                # The hit must select the SAME medical-room ID as the interior.
                canvas = page.locator("#game-canvas")
                box = canvas.bounding_box()
                assert box is not None
                width = box["width"]
                tile_w = max(26, min(54, width / 15))
                tile_h = tile_w * 0.48
                world_x = 10 + 16 * 9 / 26
                world_y = 9 + 2 * 5 / 17
                x = width * .5 + (world_x - world_y) * tile_w * .5
                y = 54 + (world_x + world_y) * tile_h * .5
                canvas.click(position={"x": x, "y": y})
                expect(panel).to_contain_text("Toiture du bâtiment principal")
                panel.locator('button[data-view="surface"]').click()
                expect(panel).to_contain_text("Cette salle possède la même emprise")
                page.screenshot(path=str(OUT / "site-room-linked.png"), full_page=True)
                # Return to the subsoil without fabricating a connection to a
                # medical room outside the longitudinal A-A section.
                page.locator('button[data-view="underground"]').first.click()
                expect(panel).to_contain_text("Coupe souterraine Y=")
            step("même Site dans les trois vues, toitures et coupe A-A", coherent_three_views)

            def annex_interior_visit():
                page.locator('button[data-view="region"]').first.click()
                canvas = page.locator("#game-canvas")
                rect = canvas.bounding_box()
                assert rect is not None
                width = rect["width"]
                w = max(26, min(54, width / 15))
                h = w * .48
                world_x, world_y = 12.35, 3.35  # Initial power plant (external annex)
                x = width / 2 + (world_x - world_y) * w * .5
                y = 54 + (world_x + world_y) * h * .5
                canvas.click(position={"x": x, "y": y})
                panel = page.locator("#right-panel")
                expect(panel).to_contain_text("Explorer l'intérieur de cette annexe")
                panel.locator('button[data-action="enter-annex"]').click()
                expect(panel).to_contain_text("Salle des turbines")
                expect(panel).to_contain_text("Plan intérieur de l'installation extérieure")
                page.screenshot(path=str(OUT / "annex-power-plant.png"), full_page=True)
                panel.locator('button[data-action="select-annex-zone"][data-room$=":control"]').click()
                expect(panel).to_contain_text("Régulation électrique")
                page.screenshot(path=str(OUT / "annex-control-room.png"), full_page=True)
                panel.locator('button[data-action="open-main-interior"]').click()
                expect(panel).to_contain_text("Intérieur du bâtiment principal")
            step("extérieur → plan intérieur de la vraie annexe électrique", annex_interior_visit)

            def underground_3d_slices():
                page.locator('button[data-view="underground"]').first.click()
                panel = page.locator("#right-panel")
                expect(panel.locator('[aria-label="Navigation des coupes souterraines"]')).to_be_visible()
                expect(panel).to_contain_text("Plan horizontal")
                expect(panel).to_contain_text("Coupe souterraine Y=")
                page.screenshot(path=str(OUT / "underground-3d-slice.png"), full_page=True)
                # Cut Y can be moved independently of the depth shown by the overview.
                before = panel.locator('[aria-label="Navigation des coupes souterraines"] h3').first.inner_text()
                panel.locator('[data-action="underground-slice-next"]').click()
                after = panel.locator('[aria-label="Navigation des coupes souterraines"] h3').first.inner_text()
                assert after != before
                panel.locator('[data-action="underground-slice-prev"]').click()
                assert panel.locator('[aria-label="Navigation des coupes souterraines"] h3').first.inner_text() == before
                panel.locator('[data-action="underground-level-next"]').click()
                expect(panel).to_contain_text("Niveau -2")
                page.screenshot(path=str(OUT / "underground-plan-second-level.png"), full_page=True)
                panel.locator('[data-action="underground-level-prev"]').click()
                expect(panel).to_contain_text("Niveau -1")
            step("3 axes réels : coupes Y et mini-plan des profondeurs", underground_3d_slices)


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

            def saved_state():
                save_from_settings()
                return page.evaluate("JSON.parse(localStorage.getItem(SCPGame.SAVE_KEY))")

            def select_surface_room(room, snapshot):
                page.locator('button[data-view="surface"]').click()
                cancel = page.locator('#right-panel button[data-action="cancel-build"]')
                if cancel.count():
                    cancel.click()
                panel = page.locator("#right-panel")
                if "mobile-open" in (panel.get_attribute("class") or ""):
                    panel.locator('[data-action="toggle-panel"]').click()
                canvas = page.locator("#game-canvas")
                box = canvas.bounding_box()
                assert box is not None
                width, height = box["width"], box["height"]
                camera = snapshot["camera"]["surface"]
                cell = max(18, min(38, min(width / (snapshot["surfaceWidth"] + 2), (height - 80) / (snapshot["surfaceHeight"] + 2)))) * camera["zoom"]
                origin_x = (width - snapshot["surfaceWidth"] * cell) / 2 + camera["offsetX"]
                origin_y = 62 + camera["offsetY"]
                canvas.click(position={"x": origin_x + (room["x"] + room["width"] - 0.3) * cell,
                                       "y": origin_y + (room["y"] + 0.3) * cell})
                add = page.locator(f'#right-panel [data-action="add-access"][data-room="{room["id"]}"]')
                if page.viewport_size["width"] < 700 and "mobile-open" not in (panel.get_attribute("class") or ""):
                    panel.locator('[data-action="toggle-panel"]').click()
                expect(add).to_be_visible()

            def import_state(snapshot):
                page.locator('button[data-view="management"]').click()
                page.locator('button[data-action="management-tab"][data-tab="settings"]').click()
                page.locator('#management-overlay [data-action="import"]').click()
                page.locator("#import-file").set_input_files({
                    "name": "access-browser-fixture.json",
                    "mimeType": "application/json",
                    "buffer": json.dumps(snapshot).encode(),
                })
                expect(page.locator("#modal-root")).to_be_hidden()
                expect(page.locator("#toast")).to_contain_text("importée")

            def configure_traffic(values):
                for traffic in ("public", "staff", "security", "medical", "contaminated", "freight", "anomaly"):
                    control = page.locator(f'[data-access-traffic="{traffic}"]')
                    control.set_checked(traffic in values)

            def surface_access_editor():
                page.locator('button[data-speed="0"]').click()
                before = saved_state()
                room = next(room for room in before["surfaceRooms"] if room["type"] == "medical")
                select_surface_room(room, before)
                page.locator(f'[data-action="add-access"][data-room="{room["id"]}"]').click()
                expect(page.locator("#surface-access-form")).to_be_visible()
                page.select_option("#access-kind", "airlock")
                page.select_option("#access-side", "south")
                page.locator("#access-offset").fill("1")
                page.select_option("#access-clearance", "2")
                page.locator("#access-capacity").fill("3")
                configure_traffic({"staff", "security", "medical"})
                page.locator('[data-action="save-access"]').click()
                expect(page.locator("#modal-root")).to_be_hidden()
                after = saved_state()
                actual_room = next(item for item in after["surfaceRooms"] if item["id"] == room["id"])
                known = {item["id"] for item in room["accessPoints"]}
                added = [item for item in actual_room["accessPoints"] if item["id"] not in known]
                assert len(added) == 1
                access = added[0]
                assert access["kind"] == "airlock" and access["side"] == "south" and access["offset"] == 0
                assert access["minClearance"] == 2 and access["queueCapacity"] == 3
                assert set(access["allowedTraffic"]) == {"staff", "security", "medical"}
                assert before["resources"]["funds"] - after["resources"]["funds"] == 1000
                assert before["resources"]["parts"] - after["resources"]["parts"] == 6
                select_surface_room(actual_room, after)
                card = page.locator(f'.surface-access-card[data-access-id="{access["id"]}"]')
                card.locator('[data-action="edit-access"]').click()
                expect(page.locator("#access-kind")).to_be_disabled()
                page.select_option("#access-clearance", "5")
                page.select_option("#access-direction", "in")
                configure_traffic({"medical"})
                page.locator('[data-action="save-access"]').click()
                card.locator('[data-action="toggle-access"]').click()
                locked = saved_state()
                locked_access = next(item for item in next(r for r in locked["surfaceRooms"] if r["id"] == room["id"])["accessPoints"] if item["id"] == access["id"])
                assert not locked_access["enabled"] and locked_access["minClearance"] == 5
                assert locked_access["direction"] == "in" and locked_access["allowedTraffic"] == ["medical"]
                assert locked["resources"]["funds"] == after["resources"]["funds"], "L'édition ne doit pas facturer à nouveau"
                select_surface_room(actual_room, locked)
                card.locator('[data-action="toggle-access"]').click()
                page.screenshot(path=str(OUT / "surface-access-desktop.png"), full_page=True)
                access_checks.update(room_id=room["id"], access_id=access["id"], placement=True, permissions=True, locking=True)

            step("éditeur de sas, habilitations et verrouillage", surface_access_editor)

            def active_airlock_resume():
                baseline = saved_state()
                fixture = page.evaluate("""snapshot => {
                    const state = SCPGame.importSave(JSON.stringify(snapshot));
                    const room = state.surfaceRooms.find(room => room.type === 'medical');
                    const access = room.accessPoints.find(access => access.kind === 'airlock');
                    const member = state.staff.find(member => member.role === 'medic');
                    state.surfaceRooms = [room];
                    state.staff = [member];
                    state.workItems = [];
                    state.minuteOfDay = 400;
                    state.elapsedMinutes = 0;
                    state.lastAutosave = 0;
                    state.speed = 1;
                    state.settings.autoPauseCritical = false;
                    state.flags['last-random-event'] = 999999;
                    state.flags['last-work-spawn'] = 999999;
                    state.flags['surface-blackout'] = false;
                    state.resources.power = 140;
                    state.resources.food = 100;
                    access.enabled = true;
                    access.minClearance = 0;
                    access.allowedTraffic = ['medical'];
                    access.direction = 'both';
                    access.powered = true;
                    access.airSupply = true;
                    access.queue = [];
                    access.cycle = undefined;
                    access.passedCount = 0;
                    room.accessPoints = [access];
                    room.staffAssigned = [member.id];
                    room.queue = [];
                    const cells = SCPGame.getSurfaceAccessCells(room, access);
                    member.position = {layer:'surface', ...cells.outside};
                    member.status = 'working';
                    member.shift = 'day';
                    member.assignmentRoomId = room.id;
                    member.target = undefined;
                    member.targetRoomId = undefined;
                    member.path = [];
                    member.pathIndex = 0;
                    member.routeBlockedReason = undefined;
                    Object.assign(member.needs, {hunger:0, fatigue:0, stress:0, health:100, contamination:0});
                    for(let i=0;i<16 && access.cycle?.phase !== 'equalizing';i++) SCPGame.advanceSimulation(state,1);
                    if(access.cycle?.phase !== 'equalizing') throw new Error('Le vrai moteur ne démarre pas le sas');
                    const doors = SCPGame.getSurfaceAccessDoorState(state,room,access);
                    if(doors.entryOpen || doors.exitOpen || access.passedCount) throw new Error('Interverrouillage incorrect');
                    state.speed = 0;
                    return state;
                }""", baseline)
                import_state(fixture)
                roundtrip = saved_state()
                cycle = roundtrip["surfaceRooms"][0]["accessPoints"][0]["cycle"]
                original = fixture["surfaceRooms"][0]["accessPoints"][0]["cycle"]
                assert cycle == original, "Le chargement a réinitialisé le cycle"
                page.reload(wait_until="load")
                page.locator("#continue-button").click()
                loaded = saved_state()
                assert loaded["surfaceRooms"][0]["accessPoints"][0]["cycle"] == cycle
                select_surface_room(loaded["surfaceRooms"][0], loaded)
                access_id = loaded["surfaceRooms"][0]["accessPoints"][0]["id"]
                counter = page.locator(f'.surface-access-card[data-access-id="{access_id}"] .access-metrics > div').filter(has_text="Passages").locator("dd")
                expect(counter).to_have_text("0")
                page.locator('button[data-speed="1"]').click()
                expect(counter).to_have_text("1", timeout=15000)
                page.locator('button[data-speed="0"]').click()
                complete = saved_state()
                completed_access = complete["surfaceRooms"][0]["accessPoints"][0]
                assert completed_access["passedCount"] == 1, "Le sas doit compter un unique franchissement"
                assert not completed_access.get("cycle")
                assert not completed_access["queue"]
                room = complete["surfaceRooms"][0]
                position = complete["staff"][0]["position"]
                assert room["x"] <= position["x"] < room["x"] + room["width"] and room["y"] <= position["y"] < room["y"] + room["height"]
                access_checks["cycle_resume"] = True
                import_state(baseline)

            step("reprise d’un sas en cours après import et rechargement", active_airlock_resume)

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
                page.locator('button[data-view="command"]').click()
                card_frames = page.evaluate("""async () => {
                    if (document.body.dataset.view !== "command") throw new Error("Vue crise absente");
                    const canvas = document.getElementById("game-canvas");
                    const proto = CanvasRenderingContext2D.prototype;
                    const originalFillText = proto.fillText;
                    const originalStrokeRect = proto.strokeRect;
                    const frames = [];
                    let frame;
                    let card;
                    // Observe the renderer's own rectangles and real font metrics;
                    // no duplicate of its column count, wrapping or card dimensions.
                    proto.strokeRect = function(x, y, width, height) {
                        if (this.canvas === canvas && frame && width > 0 && height > 0) {
                            card = {x, y, width, height, labels: []};
                            frame.cards.push(card);
                        }
                        return originalStrokeRect.apply(this, arguments);
                    };
                    proto.fillText = function(text, x, y, maxWidth) {
                        if (this.canvas === canvas && frame && card
                            && x >= card.x && x <= card.x + card.width
                            && y >= card.y && y <= card.y + card.height) {
                            const metrics = this.measureText(String(text));
                            const scale = maxWidth === undefined || metrics.width === 0
                                ? 1 : Math.min(1, maxWidth / metrics.width);
                            // actualBoundingBoxLeft/Right include the current
                            // textAlign/direction; ascent/descent use textBaseline.
                            const bounds = {
                                left: x - metrics.actualBoundingBoxLeft * scale,
                                right: x + metrics.actualBoundingBoxRight * scale,
                                top: y - metrics.actualBoundingBoxAscent,
                                bottom: y + metrics.actualBoundingBoxDescent
                            };
                            card.labels.push(String(text));
                            frame.texts += 1;
                            const inset = 1;
                            if (bounds.left < card.x + inset || bounds.right > card.x + card.width - inset
                                || bounds.top < card.y + inset || bounds.bottom > card.y + card.height - inset) {
                                frame.overflow.push({text: String(text), font: this.font,
                                    align: this.textAlign, bounds,
                                    card: {x: card.x, y: card.y, width: card.width, height: card.height}});
                            }
                        }
                        return originalFillText.apply(this, arguments);
                    };
                    try {
                        for (let index = 0; index < 2; index += 1) {
                            frame = {cards: [], texts: 0, overflow: []};
                            card = undefined;
                            frames.push(frame);
                            // Resize is a normal UI event that invalidates the canvas.
                            window.dispatchEvent(new Event("resize"));
                            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                        }
                        return frames;
                    } finally {
                        proto.fillText = originalFillText;
                        proto.strokeRect = originalStrokeRect;
                    }
                }""")
                for frame in card_frames:
                    assert len(frame["cards"]) >= 3 and frame["texts"] >= 12, "Cartes crise non observées pendant le rendu réel"
                    labels = [" ".join(card["labels"]).split() for card in frame["cards"]]
                    labels = [" ".join(words) for words in labels]
                    for title in ("Surface — accès et accueil", "Surface — médical et quarantaine"):
                        assert any(title in text for text in labels), f"Titre de zone incomplet: {title}"
                    assert not frame["overflow"], f"Texte hors de sa carte crise: {json.dumps(frame['overflow'], ensure_ascii=False)}"
                page.screenshot(path=str(OUT / "mobile.png"), full_page=True)
            step("interface mobile", mobile)

            def mobile_access_editor():
                page.locator('button[data-speed="0"]').click()
                snapshot = saved_state()
                room = next(room for room in snapshot["surfaceRooms"] if room["id"] == access_checks["room_id"])
                select_surface_room(room, snapshot)
                card = page.locator(f'.surface-access-card[data-access-id="{access_checks["access_id"]}"]')
                card.locator('[data-action="edit-access"]').click()
                expect(page.locator("#surface-access-form")).to_be_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Débordement horizontal de l'éditeur mobile"
                assert page.evaluate("""() => Array.from(document.querySelectorAll('#surface-access-form input, #surface-access-form select, #surface-access-form button')).every(element => {
                    const box=element.getBoundingClientRect();
                    return box.width===0 || (box.left>=0 && box.right<=innerWidth+1);
                })"""), "Commande d'accès hors écran mobile"
                page.locator("#access-powered").uncheck()
                page.locator("#access-air-supply").uncheck()
                page.screenshot(path=str(OUT / "surface-access-mobile.png"), full_page=True)
                page.locator('[data-action="save-access"]').click()
                changed = saved_state()
                access = next(item for item in next(r for r in changed["surfaceRooms"] if r["id"] == room["id"])["accessPoints"] if item["id"] == access_checks["access_id"])
                assert not access["powered"] and not access["airSupply"], "Le formulaire mobile n'a pas appliqué l'état des réseaux"
                select_surface_room(room, changed)
                card.locator('[data-action="edit-access"]').click()
                page.locator("#access-powered").check()
                page.locator("#access-air-supply").check()
                page.locator('[data-action="save-access"]').click()
                access_checks["mobile_editor"] = True

            step("éditeur tactile des accès et alimentation du sas", mobile_access_editor)

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
        "surface_access": access_checks,
        "storage": "native persistent Chromium profile",
    }
    (OUT / "smoke-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
if errors:
    raise SystemExit(2)

