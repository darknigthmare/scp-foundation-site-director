from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = ROOT / "tests"
OUT.mkdir(exist_ok=True)

html = (DIST / "index.html").read_text(encoding="utf-8")
css = (DIST / "styles.css").read_text(encoding="utf-8")
js = (DIST / "game.js").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="./styles.css">', f'<style>{css}</style>')
storage_shim = """<script>
(() => {
  const store = new Map();
  const shim = {
    getItem: (key) => store.has(String(key)) ? store.get(String(key)) : null,
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; }
  };
  try { Object.defineProperty(window, 'localStorage', { value: shim, configurable: true }); } catch (_) {}
})();
</script>"""
html = html.replace('<script src="./game.js"></script>', storage_shim + f'<script>{js}</script>')

results = []
errors = []

def step(name, fn):
    try:
        fn()
        results.append({"step": name, "ok": True})
    except Exception as exc:
        results.append({"step": name, "ok": False, "error": str(exc)})
        raise

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="/usr/bin/chromium",
        headless=True,
        args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--mute-audio"],
    )
    context = browser.new_context(viewport={"width": 1600, "height": 1000}, device_scale_factor=1)
    page = context.new_page()
    page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
    page.on("console", lambda msg: errors.append(f"console.{msg.type}: {msg.text}") if msg.type in ("error", "warning") else None)

    step("chargement", lambda: page.set_content(html, wait_until="load"))
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

    placement = {}
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

    def save_load():
        page.locator('button[data-action="management-tab"][data-tab="settings"]').click()
        expect(page.locator("#management-overlay")).to_contain_text("Sauvegarde")
        page.locator('#management-overlay button[data-action="save"]').click()
        expect(page.locator("#toast")).to_contain_text("Sauvegarde")
        page.locator('#management-overlay button[data-action="load"]').click()
        expect(page.locator("#toast")).to_contain_text("chargée")
    step("sauvegarde et chargement", save_load)

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
        assert page.locator("#top-bar").bounding_box() is not None
        assert page.locator("#left-nav").bounding_box() is not None
        page.screenshot(path=str(OUT / "mobile.png"), full_page=True)
    step("interface mobile", mobile)

    browser.close()

report = {
    "ok": all(r["ok"] for r in results) and not errors,
    "steps": results,
    "browser_messages": errors,
    "placement": placement,
}
(OUT / "smoke-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
if errors:
    raise SystemExit(2)
