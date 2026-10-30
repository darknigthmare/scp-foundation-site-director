namespace SCPGame {
  let activeRuntime: RuntimeState | undefined;
  let modalMode: "none" | "event" | "procedure" | "import" | "new-game" | "help" | "credits" | "surface-access" = "none";
  let procedureScpId = "";
  let accessEditorRoomId = "";
  let accessEditorAccessId = "";
  let renderedModalKey = "";
  let modalReturnFocus: HTMLElement | undefined;
  let modalReturnFocusSignature: string | undefined;
  let modalPausedGame = false;
  let renderedEndScreenKey = "";
  const ACCESS_UI_SIDES: Record<SurfaceAccessSide, string> = { north: "Nord", east: "Est", south: "Sud", west: "Ouest" };
  const ACCESS_UI_TRAFFIC: Record<SurfaceTraffic, string> = {
    staff: "Personnel", security: "Sécurité / FTM", medical: "Équipes médicales",
    contaminated: "Personnel contaminé", freight: "Logistique (personnel)",
    public: "Public (réservé)", anomaly: "Anomalies (réservé)"
  };

  function escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[character] ?? character));
  }

  function percent(value: number): string {
    return `${Math.round(value)} %`;
  }

  function focusSignature(element: HTMLElement): string | undefined {
    if (element.id) return `id:${element.id}`;
    const attributes = ["data-action", "data-view", "data-speed", "data-tab", "data-type", "data-role", "data-staff", "data-node", "data-scp", "data-room", "data-access", "data-zone", "data-order", "data-setting"];
    const selectors = attributes
      .filter((name) => element.hasAttribute(name))
      .map((name) => `[${name}="${String(element.getAttribute(name)).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`);
    return selectors.length ? `selector:${element.tagName.toLowerCase()}${selectors.join("")}` : undefined;
  }

  function findFocusTarget(container: HTMLElement, signature: string): HTMLElement | null {
    if (signature.startsWith("id:")) {
      const target = document.getElementById(signature.slice(3));
      return target && container.contains(target) ? target : null;
    }
    return container.querySelector<HTMLElement>(signature.slice("selector:".length));
  }

  function replaceHtmlPreservingInteraction(container: HTMLElement, html: string): void {
    if (container.innerHTML === html) return;
    const active = document.activeElement instanceof HTMLElement && container.contains(document.activeElement) ? document.activeElement : undefined;
    const signature = active ? focusSignature(active) : undefined;
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const nestedScroll = Array.from(container.querySelectorAll<HTMLElement>("[data-preserve-scroll]")).map((element) => ({
      key: String(element.dataset.preserveScroll),
      top: element.scrollTop,
      left: element.scrollLeft
    }));
    container.innerHTML = html;
    container.scrollTop = scrollTop;
    container.scrollLeft = scrollLeft;
    nestedScroll.forEach((entry) => {
      const element = container.querySelector<HTMLElement>(`[data-preserve-scroll="${entry.key}"]`);
      if (element) {
        element.scrollTop = entry.top;
        element.scrollLeft = entry.left;
      }
    });
    if (signature) findFocusTarget(container, signature)?.focus({ preventScroll: true });
  }

  function setPageInert(inert: boolean): void {
    const appShell = document.getElementById("app-shell") as HTMLElement | null;
    const startScreen = document.getElementById("start-screen") as HTMLElement | null;
    const endScreen = document.getElementById("end-screen") as HTMLElement | null;
    const startVisible = Boolean(startScreen && !startScreen.classList.contains("hidden"));
    const endVisible = Boolean(endScreen && !endScreen.classList.contains("hidden"));
    if (appShell) appShell.inert = inert || startVisible || endVisible;
    if (startScreen) startScreen.inert = inert;
    if (endScreen) endScreen.inert = inert;
  }

  function prepareModal(state: GameState, returnFocus: HTMLElement): void {
    if (modalMode === "none") {
      modalReturnFocus = returnFocus;
      modalReturnFocusSignature = focusSignature(returnFocus);
    }
    const startScreen = document.getElementById("start-screen");
    if (startScreen?.classList.contains("hidden") && state.speed > 0) {
      state.previousSpeed = state.speed;
      state.speed = 0;
      modalPausedGame = true;
    }
  }

  function closeModal(state: GameState): void {
    modalMode = "none";
    if (modalPausedGame && !state.currentEventId && document.getElementById("start-screen")?.classList.contains("hidden")) {
      state.speed = state.previousSpeed || 1;
    }
    modalPausedGame = false;
  }

  export function initializeUI(runtime: RuntimeState): void {
    activeRuntime = runtime;
    document.addEventListener("click", handleDelegatedClick);
    document.addEventListener("change", handleDelegatedChange);
    document.addEventListener("input", handleDelegatedInput);
    document.addEventListener("submit", handleSurfaceAccessSubmit);
    document.addEventListener("keydown", handleKeyboard);
    const fileInput = document.getElementById("import-file") as HTMLInputElement | null;
    fileInput?.addEventListener("change", handleImportFile);
    refreshUI(runtime, true);
  }

  export function showStartScreen(): void {
    const screen = document.getElementById("start-screen");
    if (screen) screen.classList.remove("hidden");
    setPageInert(modalMode !== "none");
    const continueButton = document.getElementById("continue-button") as HTMLButtonElement | null;
    if (continueButton) {
      const available = hasSavedGame();
      continueButton.disabled = !available;
      continueButton.textContent = available ? "Continuer" : "Aucune sauvegarde";
    }
  }

  export function hideStartScreen(): void {
    const screen = document.getElementById("start-screen");
    if (screen) screen.classList.add("hidden");
    setPageInert(modalMode !== "none");
  }

  export function refreshUI(runtime: RuntimeState, force = false): void {
    activeRuntime = runtime;
    if (force) runtime.canvasDirty = true;
    const state = runtime.state;
    updateTopBar(state);
    updateNavigation(state);
    updateObjectiveStrip(state);
    updateRightPanel(runtime);
    updateManagementOverlay(runtime);
    updateNotifications(state);
    updateModal(runtime);
    updateEndScreen(state);
    runtime.uiDirty = false;
    if (force) document.body.classList.toggle("high-contrast", state.settings.highContrast);
  }

  function updateTopBar(state: GameState): void {
    setText("time-display", formatTime(state.day, state.minuteOfDay));
    setText("funds-display", formatNumber(state.resources.funds));
    setText("power-display", `${Math.round(state.resources.power)}/${Math.round(state.resources.powerCapacity)}`);
    setText("water-display", `${Math.round(state.resources.water)}/${Math.round(state.resources.waterCapacity)}`);
    setText("research-display", formatNumber(state.resources.research));
    setText("intel-display", formatNumber(state.resources.intel));
    const alert = document.getElementById("alert-indicator");
    if (alert) {
      alert.textContent = state.crisis.active ? "ALERTE ROUGE" : state.reputation.suspicion > 70 ? "VOILE FRAGILE" : "SITE NOMINAL";
      alert.className = `alert-indicator ${state.crisis.active ? "critical" : state.reputation.suspicion > 70 ? "warning" : "nominal"}`;
    }
    document.querySelectorAll<HTMLElement>("[data-speed]").forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.speed) === state.speed);
      button.setAttribute("aria-pressed", String(Number(button.dataset.speed) === state.speed));
    });
  }

  function updateNavigation(state: GameState): void {
    document.querySelectorAll<HTMLElement>("#left-nav [data-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === state.view);
    });
    document.body.dataset.view = state.view;
  }

  function updateObjectiveStrip(state: GameState): void {
    const container = document.getElementById("objective-strip");
    if (!container) return;
    if (state.mode === "sandbox") {
      replaceHtmlPreservingInteraction(container, `<strong>Bac à sable</strong><span>Construisez librement, testez les procédures et déclenchez des exercices depuis le commandement.</span>`);
      return;
    }
    const chapter = state.campaign[state.currentChapter];
    if (!chapter) return;
    const current = chapter.objectives.find((objective) => !objective.complete) ?? chapter.objectives[chapter.objectives.length - 1];
    replaceHtmlPreservingInteraction(container, `
      <strong>${escapeHtml(chapter.title)}</strong>
      <span>${escapeHtml(current.title)} — ${escapeHtml(current.description)}</span>
      <div class="objective-progress"><i style="width:${clamp(current.progress / current.target * 100, 0, 100)}%"></i></div>
      <small>${round(current.progress, 1)} / ${current.target}</small>
    `);
  }

  function updateRightPanel(runtime: RuntimeState): void {
    const panel = document.getElementById("right-panel");
    if (!panel) return;
    const state = runtime.state;
    const mobileOpen = panel.classList.contains("mobile-open");
    let html = `<div class="panel-heading"><span>${viewLabel(state.view)}</span><div class="panel-actions"><button class="panel-toggle" data-action="toggle-panel" aria-expanded="${mobileOpen}" aria-controls="right-panel">${mobileOpen ? "Masquer" : "Détails"}</button><button class="icon-button" data-action="help" title="Aide" aria-label="Ouvrir l'aide">Aide</button></div></div>`;
    if (state.view === "region") html += renderRegionPanel(state);
    else if (state.view === "surface") html += renderSurfacePanel(state);
    else if (state.view === "underground") html += renderUndergroundPanel(state);
    else if (state.view === "command") html += renderCommandPanel(state);
    else html += renderManagementSummary(state);
    replaceHtmlPreservingInteraction(panel, html);
  }

  function viewLabel(view: ViewMode): string {
    const labels: Record<ViewMode, string> = {
      region: "Région",
      surface: "Complexe de surface",
      underground: "Niveaux inférieurs",
      command: "Commandement",
      management: "Gestion"
    };
    return labels[view];
  }

  function renderRegionPanel(state: GameState): string {
    const selected = state.selectedType === "facility" ? state.regionFacilities.find((entry) => entry.id === state.selectedId) : undefined;
    if (selected) {
      const definition = getRegionDefinition(selected.type);
      return `
        ${renderSelectionHeader(definition.icon, definition.name, `Niveau ${selected.level}`)}
        <p class="muted">${escapeHtml(definition.description)}</p>
        ${renderMetricGrid([
          ["État", percent(selected.condition)],
          ["Entretien", `${formatNumber(definition.upkeep * selected.level)}/j`],
          ["Couverture", signed(definition.coverImpact ?? 0)],
          ["Suspicion", signed(definition.suspicionImpact ?? 0)]
        ])}
        ${renderSelectionActions()}
        <hr>
        ${renderBuildCatalog(state, "region")}
      `;
    }
    return `
      ${renderReputationOverview(state)}
      <p class="hint">Sélectionnez une installation pour consulter son état, ou choisissez une construction puis cliquez sur la carte.</p>
      ${renderBuildCatalog(state, "region")}
    `;
  }

  function renderSurfacePanel(state: GameState): string {
    if (state.selectedType === "staff") {
      const member = state.staff.find((entry) => entry.id === state.selectedId);
      if (member) return `${renderStaffDetails(member)}<hr>${renderBuildCatalog(state, "surface")}`;
    }
    const selected = state.selectedType === "surface-room" ? state.surfaceRooms.find((entry) => entry.id === state.selectedId) : undefined;
    if (selected) {
      const definition = getSurfaceDefinition(selected.type);
      const present = state.staff.filter((member) => selected.staffAssigned.includes(member.id) && member.status === "working"
        && member.position.layer === "surface" && member.targetRoomId === selected.id
        && member.position.x === Math.floor(selected.x + selected.width / 2) && member.position.y === Math.floor(selected.y + selected.height / 2)).length;
      const efficiency = !selected.enabled ? "Fermée" : Object.keys(definition.requiredRoles).length > 0
        ? `${present} sur place / ${selected.staffAssigned.length} affectés` : "Libre-service";
      return `
        ${renderSelectionHeader(definition.icon, definition.name, efficiency)}
        <p class="muted">${escapeHtml(definition.description)}</p>
        ${renderMetricGrid([
          ["État", percent(selected.condition)],
          ["Propreté", percent(selected.cleanliness)],
          ["File de service", String(selected.queue.length)],
          ["Personnel", String(selected.staffAssigned.length)]
        ])}
        ${renderAssignedStaff(state, selected.staffAssigned)}
        ${renderSelectionActions()}
        ${renderSurfaceAccessPanel(state, selected)}
        <hr>
        ${renderBuildCatalog(state, "surface")}
      `;
    }
    const queues = state.surfaceRooms.reduce((sum, room) => sum + room.queue.length
      + getSurfaceAccesses(state, room).reduce((waiting, access) => waiting + access.queue.length, 0), 0) + state.workItems.length;
    return `
      <section class="summary-card">
        <h3>Activité opérationnelle</h3>
        ${renderMetricGrid([
          ["Personnel", String(state.staff.filter((member) => member.status !== "dead").length)],
          ["Files totales", String(queues)],
          ["Moral", percent(state.reputation.personnel)],
          ["Blessés", String(state.staff.filter((member) => member.status === "injured").length)]
        ])}
      </section>
      <p class="hint">Les salles fonctionnent comme dans un jeu de gestion hospitalière : capacité, personnel, file, maintenance et trajets influencent directement le Site.</p>
      ${renderBuildCatalog(state, "surface")}
    `;
  }

  function renderSurfaceAccessPanel(state: GameState, room: SurfaceRoom): string {
    if (room.type === "corridor") return `<p class="hint">Les couloirs sont des espaces de circulation. Les portes et sas se placent sur les limites des autres salles.</p>`;
    const accesses = getSurfaceAccesses(state, room);
    return `<section class="surface-access-panel" aria-label="Accès de la salle">
      <div class="catalog-heading"><h3>Portes et sas</h3><button data-action="add-access" data-room="${escapeHtml(room.id)}">Ajouter un accès</button></div>
      <p class="hint">Les passages numérotés sur le plan sont les seules entrées et sorties de cette salle. Pour sécuriser toute la salle, configurez ou verrouillez chacun de ses accès.</p>
      ${accesses.length === 0 ? `<p class="staff-route-status">Salle sans accès : aucun agent ne peut franchir ses limites.</p>` : ""}
      <div class="surface-access-list">${accesses.map((access, index) => {
        const attrs = `data-room="${escapeHtml(room.id)}" data-access="${escapeHtml(access.id)}"`;
        const occupant = access.cycle ? state.staff.find((member) => member.id === access.cycle?.staffId) : undefined;
        const status = getSurfaceAccessStatus(state, room, access);
        const traffic = access.allowedTraffic.map((kind) => ACCESS_UI_TRAFFIC[kind]).join(", ") || "Aucun flux autorisé";
        const direction = access.direction === "in" ? "Entrée seule" : access.direction === "out" ? "Sortie seule" : "Dans les deux sens";
        const waiting = access.queue.map((request) => {
          const member = state.staff.find((entry) => entry.id === request.staffId);
          return `${member?.name ?? "Agent absent"} · ${Math.max(0, Math.ceil(request.expiresAt - state.elapsedMinutes))} min avant expiration`;
        });
        return `<article class="surface-access-card ${access.enabled ? "" : "access-locked"}" data-access-id="${escapeHtml(access.id)}">
          <header><strong><b class="access-number">${index + 1}</b>${access.kind === "airlock" ? "Sas interverrouillé" : "Porte"}</strong><span>${ACCESS_UI_SIDES[access.side]} · case ${access.offset + 1}</span></header>
          <p class="access-status">${escapeHtml(status)}</p>
          <p>Niveau ${access.minClearance} minimum · ${direction}</p>
          <p class="access-traffic-label">${escapeHtml(traffic)}</p>
          ${access.kind === "door" ? `<p>Passages réussis : ${access.passedCount}</p>` : ""}
          ${access.kind === "airlock" ? `<dl class="access-metrics"><div><dt>File</dt><dd>${access.queue.length} / ${access.queueCapacity}</dd></div><div><dt>Passages</dt><dd>${access.passedCount}</dd></div></dl>
            <p>${occupant ? `Dans le sas : ${escapeHtml(occupant.name)} · ${access.cycle?.remaining ?? 0} min dans cette phase` : "Sas libre"}</p>
            ${waiting.length ? `<ol class="access-waiting">${waiting.map((label) => `<li>${escapeHtml(label)}</li>`).join("")}</ol>` : ""}
            <p class="access-supplies">Électricité locale : ${access.powered ? "raccordée" : "coupée"} · Air : ${access.airSupply ? "disponible" : "coupé"}</p>` : ""}
          <div class="action-row"><button data-action="edit-access" ${attrs}>Configurer</button><button data-action="toggle-access" ${attrs}>${access.enabled ? "Verrouiller" : "Déverrouiller"}</button><button class="danger" data-action="remove-access" ${attrs} ${access.cycle ? "disabled" : ""}>Démonter</button></div>
          ${access.kind === "airlock" ? `<div class="action-row"><button data-action="toggle-access-power" ${attrs}>${access.powered ? "Couper l’électricité" : "Rétablir l’électricité"}</button><button data-action="toggle-access-air" ${attrs}>${access.airSupply ? "Couper l’air" : "Rétablir l’air"}</button></div>
            <button class="wide-button warning" data-action="evacuate-access" ${attrs} ${access.cycle || access.queue.length ? "" : "disabled"}>Évacuer côté d’origine et verrouiller</button>` : ""}
        </article>`;
      }).join("")}</div>
      <p class="hint">Démontage : récupération de 35 % des crédits et 40 % des pièces payés. Les accès inclus dans la salle n’offrent aucun remboursement.</p>
    </section>`;
  }

  function accessDefaultConfig(state: GameState, room: SurfaceRoom): SurfaceAccessConfig {
    const config: SurfaceAccessConfig = {
      side: "south", offset: 0, kind: "door", enabled: true, minClearance: 0,
      allowedTraffic: Object.keys(ACCESS_UI_TRAFFIC) as SurfaceTraffic[], direction: "both",
      queueCapacity: 4, powered: true, airSupply: true
    };
    const accesses = getSurfaceAccesses(state, room);
    for (const side of ["south", "north", "east", "west"] as SurfaceAccessSide[]) {
      const length = side === "north" || side === "south" ? room.width : room.height;
      for (let offset = 0; offset < length; offset += 1) {
        if (accesses.some((access) => access.side === side && access.offset === offset)) continue;
        const { outside } = getSurfaceAccessCells(room, { side, offset });
        if (outside.x < 0 || outside.y < 0 || outside.x >= state.surfaceWidth || outside.y >= state.surfaceHeight) continue;
        if (state.surfaceRooms.some((other) => other.id !== room.id && other.type !== "corridor"
          && pointInRect(outside, other.x, other.y, other.width, other.height))) continue;
        return { ...config, side, offset };
      }
    }
    return config;
  }

  function renderSurfaceAccessModal(state: GameState): string {
    const room = state.surfaceRooms.find((candidate) => candidate.id === accessEditorRoomId);
    const access = room && accessEditorAccessId ? getSurfaceAccesses(state, room).find((candidate) => candidate.id === accessEditorAccessId) : undefined;
    if (!room || accessEditorAccessId && !access) return `<div class="modal-card"><header><h2 id="modal-title">Accès introuvable</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><p>La salle ou le passage sélectionné n’existe plus.</p></div>`;
    const config = access ?? accessDefaultConfig(state, room);
    return `<form id="surface-access-form" class="modal-card access-modal" aria-describedby="access-editor-description">
      <header><div><span>CONTRÔLE DES ACCÈS</span><h2 id="modal-title">${access ? "Configurer le passage" : "Ajouter une porte ou un sas"}</h2></div><button type="button" data-action="close-modal" aria-label="Fermer">×</button></header>
      <p id="access-editor-description">${escapeHtml(getSurfaceDefinition(room.type).name)}. Choisissez une case sur un mur de la salle. L’emplacement est compté de gauche à droite au nord et au sud, et de haut en bas à l’est et à l’ouest.</p>
      <div class="access-editor-layout">
        <div class="access-field-grid">
          <label for="access-kind">Type<select id="access-kind" ${access ? "disabled" : ""}><option value="door" ${config.kind === "door" ? "selected" : ""}>Porte</option><option value="airlock" ${config.kind === "airlock" ? "selected" : ""}>Sas interverrouillé</option></select></label>
          <label for="access-side">Mur<select id="access-side">${(Object.keys(ACCESS_UI_SIDES) as SurfaceAccessSide[]).map((side) => `<option value="${side}" ${config.side === side ? "selected" : ""}>${ACCESS_UI_SIDES[side]}</option>`).join("")}</select></label>
          <label for="access-offset">Emplacement sur le mur<input id="access-offset" type="number" inputmode="numeric" min="1" max="${config.side === "north" || config.side === "south" ? room.width : room.height}" step="1" value="${config.offset + 1}" required></label>
          <label for="access-clearance">Habilitation minimale<select id="access-clearance">${[0, 1, 2, 3, 4, 5].map((level) => `<option value="${level}" ${config.minClearance === level ? "selected" : ""}>Niveau ${level}</option>`).join("")}</select></label>
          <label for="access-direction">Sens de circulation<select id="access-direction"><option value="both" ${config.direction === "both" ? "selected" : ""}>Entrée et sortie</option><option value="in" ${config.direction === "in" ? "selected" : ""}>Entrée seule</option><option value="out" ${config.direction === "out" ? "selected" : ""}>Sortie seule</option></select></label>
          <label for="access-capacity" data-airlock-field>Places en attente<input id="access-capacity" type="number" inputmode="numeric" min="1" max="16" step="1" value="${config.queueCapacity}" required></label>
        </div>
        <div class="access-preview-block"><div class="access-plan" id="access-preview" role="img"><span>${escapeHtml(getSurfaceDefinition(room.type).name)}<small>${room.width} × ${room.height} cases</small></span><i id="access-preview-marker" aria-hidden="true"></i></div><p id="access-placement-hint" class="hint" aria-live="polite"></p></div>
      </div>
      <fieldset class="access-traffic-options"><legend>Flux autorisés</legend><div>${(Object.keys(ACCESS_UI_TRAFFIC) as SurfaceTraffic[]).map((traffic) => `<label><input type="checkbox" data-access-traffic="${traffic}" ${config.allowedTraffic.includes(traffic) ? "checked" : ""}>${ACCESS_UI_TRAFFIC[traffic]}</label>`).join("")}</div><p class="hint">Au-delà de 65 % de contamination, le filtre « Personnel contaminé » remplace celui du métier. Public et anomalies sont réservés aux futures circulations dédiées.</p></fieldset>
      <div class="access-switches"><label><input id="access-enabled" type="checkbox" ${config.enabled ? "checked" : ""}> Passage déverrouillé</label><label data-airlock-field><input id="access-powered" type="checkbox" ${config.powered ? "checked" : ""}> Électricité locale raccordée</label><label data-airlock-field><input id="access-air-supply" type="checkbox" ${config.airSupply ? "checked" : ""}> Air disponible</label></div>
      <p class="hint" data-airlock-field>Une personne à la fois, dans l’ordre d’arrivée. Les deux portes ne s’ouvrent jamais ensemble. Une coupure d’électricité ou d’air suspend le cycle, portes fermées. L’évacuation ramène l’occupant du côté d’origine et verrouille le passage.</p>
      ${access?.cycle || access?.queue.length ? `<p class="staff-route-status">Passage occupé : évacuez-le avant de modifier son emplacement, ses habilitations ou son sens. Sa capacité ne peut pas être réduite sous la file actuelle. Vous pouvez encore agir sur son verrouillage et ses alimentations.</p>` : ""}
      <p id="access-form-error" class="status-danger" role="alert"></p>
      <footer><span id="access-cost">${access ? "Configuration sans frais" : "250 crédits · 2 pièces"}</span><button type="submit" data-action="save-access">${access ? "Enregistrer" : "Installer le passage"}</button></footer>
    </form>`;
  }

  function updateSurfaceAccessForm(state: GameState): void {
    if (modalMode !== "surface-access") return;
    const room = state.surfaceRooms.find((candidate) => candidate.id === accessEditorRoomId);
    if (!room) return;
    const side = (document.getElementById("access-side") as HTMLSelectElement | null)?.value as SurfaceAccessSide;
    const offsetInput = document.getElementById("access-offset") as HTMLInputElement | null;
    if (!offsetInput || !(side in ACCESS_UI_SIDES)) return;
    const length = side === "north" || side === "south" ? room.width : room.height;
    offsetInput.max = String(length);
    const offset = Number(offsetInput.value) - 1;
    const marker = document.getElementById("access-preview-marker");
    const preview = document.getElementById("access-preview");
    const normalized = clamp((offset + 0.5) / length, 0, 1);
    if (marker) {
      marker.style.left = `${side === "west" ? 0 : side === "east" ? 100 : normalized * 100}%`;
      marker.style.top = `${side === "north" ? 0 : side === "south" ? 100 : normalized * 100}%`;
      marker.classList.toggle("vertical", side === "east" || side === "west");
    }
    preview?.setAttribute("aria-label", `Plan de la salle : accès sur le mur ${ACCESS_UI_SIDES[side]}, emplacement ${offset + 1} sur ${length}.`);
    let message = `${ACCESS_UI_SIDES[side]} · emplacement ${offset + 1} sur ${length}.`;
    let invalid = !Number.isInteger(offset) || offset < 0 || offset >= length;
    if (invalid) message = `Choisissez un emplacement entier entre 1 et ${length}.`;
    else {
      const { outside } = getSurfaceAccessCells(room, { side, offset });
      if (outside.x < 0 || outside.y < 0 || outside.x >= state.surfaceWidth || outside.y >= state.surfaceHeight) {
        message += " Ce mur donne hors du complexe.";
        invalid = true;
      } else if (getSurfaceAccesses(state, room).some((access) => access.id !== accessEditorAccessId && access.side === side && access.offset === offset)) {
        message += " Un autre accès occupe déjà cette case.";
        invalid = true;
      } else if (state.surfaceRooms.some((other) => other.id !== room.id && other.type !== "corridor" && pointInRect(outside, other.x, other.y, other.width, other.height))) {
        message += " Une salle voisine bloque l’autre côté.";
        invalid = true;
      } else message += " L’autre côté est dégagé.";
    }
    const hint = document.getElementById("access-placement-hint");
    if (hint) { hint.textContent = message; hint.classList.toggle("status-danger", invalid); }
    preview?.classList.toggle("invalid", invalid);
    const airlock = (document.getElementById("access-kind") as HTMLSelectElement | null)?.value === "airlock";
    document.querySelectorAll<HTMLElement>("[data-airlock-field]").forEach((element) => { element.hidden = !airlock; });
    const capacity = document.getElementById("access-capacity") as HTMLInputElement | null;
    if (capacity) capacity.disabled = !airlock;
    const price = document.getElementById("access-cost");
    if (price) price.textContent = accessEditorAccessId ? "Configuration sans frais" : airlock ? "1 000 crédits · 6 pièces" : "250 crédits · 2 pièces";
  }

  function saveSurfaceAccessFromModal(state: GameState): { ok: boolean; message: string } {
    const form = document.getElementById("surface-access-form") as HTMLFormElement | null;
    if (!form || !form.reportValidity()) return { ok: false, message: "Vérifiez les champs du passage." };
    const value = (id: string): string => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement).value;
    const checked = (id: string): boolean => (document.getElementById(id) as HTMLInputElement).checked;
    const config: SurfaceAccessConfig = {
      side: value("access-side") as SurfaceAccessSide, offset: Number(value("access-offset")) - 1,
      kind: value("access-kind") as SurfaceAccessConfig["kind"], enabled: checked("access-enabled"),
      minClearance: Number(value("access-clearance")) as SurfaceAccessConfig["minClearance"],
      direction: value("access-direction") as SurfaceAccessConfig["direction"], queueCapacity: Number(value("access-capacity")),
      powered: checked("access-powered"), airSupply: checked("access-air-supply"),
      allowedTraffic: Array.from(form.querySelectorAll<HTMLInputElement>("[data-access-traffic]:checked")).map((input) => input.dataset.accessTraffic as SurfaceTraffic)
    };
    const result = accessEditorAccessId ? updateSurfaceAccess(state, accessEditorRoomId, accessEditorAccessId, config) : addSurfaceAccess(state, accessEditorRoomId, config);
    if (result.ok) closeModal(state);
    else {
      const error = document.getElementById("access-form-error");
      if (error) error.textContent = result.message;
    }
    return result;
  }

  function handleSurfaceAccessSubmit(event: Event): void {
    if (!(event.target instanceof HTMLFormElement) || event.target.id !== "surface-access-form" || !activeRuntime) return;
    event.preventDefault();
    const result = saveSurfaceAccessFromModal(activeRuntime.state);
    showToast(result.message, result.ok ? "success" : "error");
    activeRuntime.uiDirty = true;
    refreshUI(activeRuntime, true);
  }

  function renderUndergroundPanel(state: GameState): string {
    const selected = state.selectedType === "underground-room" ? state.undergroundRooms.find((entry) => entry.id === state.selectedId) : undefined;
    if (selected) {
      const definition = getUndergroundDefinition(selected.type);
      const scp = selected.scpId ? state.scps.find((entry) => entry.id === selected.scpId) : undefined;
      return `
        ${renderSelectionHeader(definition.icon, definition.name, `Niveau -${selected.level + 1}`)}
        <p class="muted">${escapeHtml(definition.description)}</p>
        ${renderMetricGrid([
          ["État", percent(selected.condition)],
          ["Confinement", String(getEffectiveRoomContainment(selected))],
          ["Sécurité", String(getEffectiveRoomSecurity(selected))],
          ["Équipe", String(selected.staffAssigned.length)],
          ["Habilitation", `Niveau ${getUndergroundClearanceRequirement(selected)}`],
          ["Ascenseur", hasUndergroundElevatorConnection(state, selected) ? "Relié" : "Non relié"],
          ["Galerie", selected.sealed ? "Scellée" : "Ouverte"]
        ])}
        ${scp ? renderContainedScpCard(state, scp) : renderCompatibleTransfers(state, selected)}
        ${renderSelectionActions()}
        <button class="wide-button" data-action="toggle-underground-seal" data-room="${escapeHtml(selected.id)}">${selected.sealed ? "Rouvrir le secteur" : "Sceller le secteur"}</button>
        <hr>
        ${renderBuildCatalog(state, "underground")}
      `;
    }
    return `
      <section class="summary-card">
        <h3>Confinement profond</h3>
        ${renderMetricGrid([
          ["SCP confinés", String(state.scps.filter((scp) => scp.contained).length)],
          ["Cellules libres", String(state.undergroundRooms.filter((room) => !room.scpId && getUndergroundDefinition(room.type).containment >= 4).length)],
          ["Niveaux", String(new Set(state.undergroundRooms.map((room) => room.level)).size)],
          ["Risque max", percent(Math.max(0, ...state.scps.filter((scp) => scp.contained).map((scp) => scp.breachRisk)))]
        ])}
      </section>
      ${renderUncontainedScps(state)}
      ${renderBuildCatalog(state, "underground")}
    `;
  }

  function renderCommandPanel(state: GameState): string {
    if (!state.crisis.active) {
      const resolved = state.crisis.resolved;
      return `
        <section class="summary-card">
          <h3>${resolved ? "Rapport après action" : "État nominal"}</h3>
          <p class="muted">${resolved ? `Dernier résultat : ${state.crisis.resolved === "success" ? "crise résolue" : "échec"}.` : "Les alarmes, portes, réseaux et équipes sont coordonnés ici."}</p>
          ${resolved ? `<button class="wide-button" data-action="ack-crisis">Archiver le rapport</button>` : ""}
        </section>
        <section class="summary-card">
          <h3>Exercices contrôlés</h3>
          <button class="wide-button warning" data-action="start-drill" data-drill="power">Panne multisectorielle</button>
          <button class="wide-button warning" data-action="start-drill" data-drill="biohazard">Exercice biologique</button>
          <button class="wide-button warning" data-action="start-drill" data-drill="infiltration">Exercice d'infiltration</button>
        </section>
      `;
    }
    const selected = state.selectedType === "zone" ? state.crisis.zones.find((entry) => entry.id === state.selectedId) : [...state.crisis.zones].sort((a, b) => b.threat - a.threat)[0];
    if (!selected) return "";
    const orders: CrisisOrderType[] = ["lockdown", "evacuate", "deploy-security", "deploy-mtf", "restore-power", "decontaminate", "medical-response", "seal-ventilation", "amnestic-response"];
    return `
      <div class="zone-selector" role="group" aria-label="Zones de crise">
        ${state.crisis.zones.map((zone) => `<button data-action="select-zone" data-zone="${zone.id}" aria-pressed="${zone.id === selected.id}"><span>${escapeHtml(zone.name)}</span><b>${Math.round(zone.threat)} %</b></button>`).join("")}
      </div>
      ${renderSelectionHeader("!", selected.name, `Menace ${Math.round(selected.threat)} %`)}
      ${renderMetricGrid([
        ["Population", String(selected.population)],
        ["Victimes", String(selected.casualties)],
        ["Sécurité", percent(selected.security)],
        ["Contamination", percent(selected.contamination)]
      ])}
      <h3 class="section-title">Ordres disponibles</h3>
      <div class="order-grid">
        ${orders.map((order) => `<button data-action="crisis-order" data-order="${order}" data-zone="${selected.id}">${crisisOrderLabel(order)}</button>`).join("")}
      </div>
      <button class="wide-button" data-action="resume-crisis">${state.speed === 0 ? "Reprendre la simulation" : "Mettre en pause"}</button>
      <h3 class="section-title">Journal de crise</h3>
      <div class="compact-log">${state.crisis.log.slice(0, 8).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>
    `;
  }

  function renderManagementSummary(state: GameState): string {
    return `
      ${renderReputationOverview(state)}
      <section class="summary-card">
        <h3>Résumé du Site</h3>
        ${renderMetricGrid([
          ["Personnel", String(state.staff.length)],
          ["SCP connus", String(state.scps.filter((scp) => scp.discovered).length)],
          ["Recherches", String(state.researchNodes.filter((node) => node.completed).length)],
          ["Incidents", String(state.scps.reduce((sum, scp) => sum + scp.incidents, 0))]
        ])}
      </section>
      <p class="hint">Les onglets de gestion occupent le panneau central.</p>
    `;
  }

  function renderSelectionHeader(icon: string, title: string, subtitle: string): string {
    return `<div class="selection-header"><div class="selection-icon">${escapeHtml(icon)}</div><div><h2>${escapeHtml(title)}</h2><span>${escapeHtml(subtitle)}</span></div></div>`;
  }

  function renderSelectionActions(): string {
    return `<div class="action-row"><button data-action="upgrade-selected">Améliorer</button><button data-action="repair-selected">Réparer</button><button data-action="demolish-selected" class="danger">Démolir</button></div>`;
  }

  function renderMetricGrid(entries: Array<[string, string]>): string {
    return `<div class="metric-grid">${entries.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`;
  }

  function signed(value: number): string {
    return `${value >= 0 ? "+" : ""}${value}`;
  }

  function renderReputationOverview(state: GameState): string {
    return `
      <section class="summary-card">
        <h3>Équilibre stratégique</h3>
        ${renderProgressMetric("Commandement", state.reputation.command)}
        ${renderProgressMetric("Personnel", state.reputation.personnel)}
        ${renderProgressMetric("Couverture", state.reputation.cover)}
        ${renderProgressMetric("Éthique", state.reputation.ethics)}
        ${renderProgressMetric("Suspicion", state.reputation.suspicion, true)}
      </section>
    `;
  }

  function renderProgressMetric(label: string, value: number, dangerHigh = false): string {
    const danger = dangerHigh ? value > 65 : value < 40;
    const warning = dangerHigh ? value > 40 : value < 65;
    return `<div class="progress-metric"><span>${escapeHtml(label)}</span><div><i class="${danger ? "danger" : warning ? "warning" : "good"}" style="width:${clamp(value, 0, 100)}%"></i></div><b>${Math.round(value)}</b></div>`;
  }

  function renderBuildCatalog(state: GameState, layer: Layer): string {
    const selection = state.buildSelection;
    let items: Array<{ type: BuildType; name: string; icon: string; cost: Cost; description: string; unlocked: boolean }> = [];
    if (layer === "region") {
      items = REGION_FACILITY_DEFINITIONS.map((definition) => ({ type: definition.type, name: definition.name, icon: definition.icon, cost: definition.cost, description: definition.description, unlocked: isRegionDefinitionUnlocked(state, definition) }));
    } else if (layer === "surface") {
      items = SURFACE_ROOM_DEFINITIONS.filter((definition) => definition.type !== "corridor").map((definition) => ({ type: definition.type, name: definition.name, icon: definition.icon, cost: definition.cost, description: definition.description, unlocked: isSurfaceDefinitionUnlocked(state, definition) }));
    } else {
      items = UNDERGROUND_ROOM_DEFINITIONS.map((definition) => ({ type: definition.type, name: definition.name, icon: definition.icon, cost: definition.cost, description: definition.description, unlocked: isUndergroundDefinitionUnlocked(state, definition) }));
    }
    return `
      <div class="catalog-heading"><h3>Construction</h3>${selection?.layer === layer ? `<button data-action="cancel-build">Annuler</button>` : ""}</div>
      ${selection?.layer === layer ? `<p class="build-active">Placement : <strong>${escapeHtml(items.find((item) => item.type === selection.type)?.name ?? String(selection.type))}</strong></p>` : ""}
      <div class="build-catalog">
        ${items.map((item) => `
          <button class="build-item ${selection?.type === item.type ? "active" : ""}" data-action="build" data-layer="${layer}" data-type="${item.type}" ${item.unlocked ? "" : "disabled"} title="${escapeHtml(item.description)}">
            <span>${escapeHtml(item.icon)}</span>
            <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(costToString(item.cost) || "Gratuit")}</small></div>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderAssignedStaff(state: GameState, ids: string[]): string {
    if (ids.length === 0) return `<p class="status-warning">Aucun personnel assigné automatiquement.</p>`;
    return `<div class="assigned-list">${ids.map((id) => {
      const member = state.staff.find((entry) => entry.id === id);
      return member ? `<button data-action="select-staff" data-staff="${member.id}"><i style="background:${roleColor(member.role)}"></i>${escapeHtml(member.name)}</button>` : "";
    }).join("")}</div>`;
  }

  function renderStaffDetails(member: StaffMember): string {
    return `
      ${renderSelectionHeader(member.role === "mtf" ? "FTM" : "●", member.name, `${ROLE_LABELS[member.role]} · Niveau ${member.clearance}`)}
      <div class="trait-list">${member.traits.map((trait) => `<span>${escapeHtml(trait)}</span>`).join("")}</div>
      ${renderMetricGrid([
        ["Santé", percent(member.needs.health)],
        ["Moral", percent(member.needs.morale)],
        ["Fatigue", percent(member.needs.fatigue)],
        ["Stress", percent(member.needs.stress)]
      ])}
      <p class="access-traffic-label">Circulation : ${escapeHtml(ACCESS_UI_TRAFFIC[getStaffSurfaceTraffic(member)])}</p>
      ${member.routeBlockedReason ? `<p class="staff-route-status" role="status">${escapeHtml(member.routeBlockedReason)}</p>` : ""}
      <div class="skill-list">
        ${renderSkill("Recherche", member.skills.research)}
        ${renderSkill("Sécurité", member.skills.security)}
        ${renderSkill("Ingénierie", member.skills.engineering)}
        ${renderSkill("Médecine", member.skills.medicine)}
      </div>
      <div class="action-row"><button data-action="train-staff" data-staff="${member.id}">Former</button>${member.role !== "director" ? `<button class="danger" data-action="dismiss-staff" data-staff="${member.id}">Renvoyer</button>` : ""}</div>
      <div class="action-row"><button data-action="set-shift" data-staff="${member.id}" data-shift="day" ${member.shift === "day" ? "disabled" : ""}>Équipe jour</button><button data-action="set-shift" data-staff="${member.id}" data-shift="night" ${member.shift === "night" ? "disabled" : ""}>Équipe nuit</button><button data-action="vet-staff" data-staff="${member.id}">Contrôle interne</button></div>
    `;
  }

  function renderSkill(label: string, value: number): string {
    return `<div><span>${escapeHtml(label)}</span><div><i style="width:${value}%"></i></div><b>${Math.round(value)}</b></div>`;
  }

  function renderContainedScpCard(state: GameState, scp: SCPInstance): string {
    const definition = getSCPDefinition(scp.definitionId);
    const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
    return `
      <section class="scp-card" style="--class-color:${objectClassColor(definition.objectClass)}">
        <header><strong>${definition.designation}</strong><span>${definition.objectClass}</span></header>
        <h3>${escapeHtml(definition.name)}</h3>
        ${renderProgressMetric("Conformité", procedure?.compliance ?? 0)}
        ${renderProgressMetric("Risque", scp.breachRisk, true)}
        <p>${escapeHtml(scp.activeEffect)}</p>
        <button class="wide-button" data-action="open-procedure" data-scp="${scp.id}">Modifier la procédure</button>
      </section>
    `;
  }

  function renderCompatibleTransfers(state: GameState, room: UndergroundRoom): string {
    const candidates = state.scps.filter((scp) => scp.discovered && (!scp.contained || scp.roomId === room.id) && getCompatibleRooms(state, scp).some((entry) => entry.id === room.id));
    if (candidates.length === 0) return `<p class="hint">Aucun dossier compatible disponible pour cette cellule.</p>`;
    return `<div class="transfer-list"><h3>Transferts compatibles</h3>${candidates.map((scp) => {
      const definition = getSCPDefinition(scp.definitionId);
      return `<button data-action="transfer-scp" data-scp="${scp.id}" data-room="${room.id}"><strong>${definition.designation}</strong><span>${escapeHtml(definition.name)} · ${definition.objectClass}</span></button>`;
    }).join("")}</div>`;
  }

  function renderUncontainedScps(state: GameState): string {
    const available = state.scps.filter((scp) => scp.discovered && !scp.contained);
    if (available.length === 0) return "";
    return `<section class="summary-card"><h3>Dossiers en attente</h3><div class="transfer-list">${available.slice(0, 6).map((scp) => {
      const definition = getSCPDefinition(scp.definitionId);
      return `<button data-action="focus-scp" data-scp="${scp.id}"><strong>${definition.designation}</strong><span>${escapeHtml(definition.name)} · risque ${definition.risk}</span></button>`;
    }).join("")}</div></section>`;
  }

  function updateManagementOverlay(runtime: RuntimeState): void {
    const overlay = document.getElementById("management-overlay");
    if (!overlay) return;
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
    const managementActive = runtime.state.view === "management";
    if (canvas) {
      canvas.inert = managementActive;
      canvas.tabIndex = managementActive ? -1 : 0;
      canvas.toggleAttribute("aria-hidden", managementActive);
    }
    if (!managementActive) {
      overlay.classList.add("hidden");
      return;
    }
    overlay.classList.remove("hidden");
    const state = runtime.state;
    const tab = String(state.flags["management-tab"] ?? "dashboard");
    replaceHtmlPreservingInteraction(overlay, `
      <div class="management-shell">
        <nav class="management-tabs">
          ${managementTabButton("dashboard", "Tableau de bord", tab)}
          ${managementTabButton("staff", "Personnel", tab)}
          ${managementTabButton("scps", "Dossiers SCP", tab)}
          ${managementTabButton("research", "Recherche", tab)}
          ${managementTabButton("campaign", "Campagne", tab)}
          ${managementTabButton("reports", "Rapports", tab)}
          ${managementTabButton("settings", "Sauvegarde", tab)}
        </nav>
        <div class="management-content" data-preserve-scroll="management-content">${renderManagementTab(state, tab)}</div>
      </div>
    `);
  }

  function managementTabButton(id: string, label: string, active: string): string {
    return `<button data-action="management-tab" data-tab="${id}" class="${id === active ? "active" : ""}">${escapeHtml(label)}</button>`;
  }

  function renderManagementTab(state: GameState, tab: string): string {
    switch (tab) {
      case "staff": return renderStaffManagement(state);
      case "scps": return renderScpManagement(state);
      case "research": return renderResearchManagement(state);
      case "campaign": return renderCampaignManagement(state);
      case "reports": return renderReports(state);
      case "settings": return renderSettings(state);
      default: return renderDashboard(state);
    }
  }

  function renderDashboard(state: GameState): string {
    const active = state.staff.filter((member) => member.status !== "dead");
    const averageFatigue = active.reduce((sum, member) => sum + member.needs.fatigue, 0) / Math.max(1, active.length);
    const averageStress = active.reduce((sum, member) => sum + member.needs.stress, 0) / Math.max(1, active.length);
    const activeScps = state.scps.filter((scp) => scp.contained);
    const averageCompliance = activeScps.reduce((sum, scp) => sum + evaluateProcedureCompliance(state, scp), 0) / Math.max(1, activeScps.length);
    return `
      <div class="dashboard-grid">
        <section><h2>Site Deep Protocol</h2><p>${formatTime(state.day, state.minuteOfDay)} · ${state.mode === "campaign" ? "Campagne" : "Bac à sable"} · difficulté ${state.settings.difficulty}</p>${renderReputationOverview(state)}</section>
        <section><h3>Capacité humaine</h3>${renderMetricGrid([["Actifs", String(active.length)], ["Fatigue moyenne", percent(averageFatigue)], ["Stress moyen", percent(averageStress)], ["Décès", String(state.staff.filter((member) => member.status === "dead").length)]])}</section>
        <section><h3>Confinement</h3>${renderMetricGrid([["SCP actifs", String(activeScps.length)], ["Conformité", percent(averageCompliance)], ["Incidents", String(state.scps.reduce((sum, scp) => sum + scp.incidents, 0))], ["Cellules", String(state.undergroundRooms.filter((room) => getUndergroundDefinition(room.type).containment >= 4).length)]])}</section>
        <section><h3>Stocks critiques</h3>${renderMetricGrid([["Rations", formatNumber(state.resources.food)], ["Médical", formatNumber(state.resources.medical)], ["Pièces", formatNumber(state.resources.parts)], ["Chimie", formatNumber(state.resources.chemicals)]])}</section>
      </div>
    `;
  }

  function renderStaffManagement(state: GameState): string {
    const roles = Object.keys(ROLE_LABELS) as StaffRole[];
    return `
      <div class="management-header"><div><h2>Personnel</h2><p>Recrutement, formation, habilitations, santé et charge opérationnelle.</p></div></div>
      <div class="hire-strip">${roles.filter((role) => role !== "director").map((role) => `<button data-action="hire-staff" data-role="${role}">+ ${ROLE_LABELS[role]}</button>`).join("")}</div>
      <div class="data-table staff-table">
        <div class="table-row table-head"><span>Nom</span><span>Rôle</span><span>État</span><span>Moral</span><span>Fatigue</span><span>Actions</span></div>
        ${state.staff.map((member) => `
          <div class="table-row">
            <span><i class="role-dot" style="background:${roleColor(member.role)}"></i>${escapeHtml(member.name)}<small>Niv. ${member.clearance} · loyauté ${Math.round(member.loyalty)} · ${member.traits.map(escapeHtml).join(", ")}</small></span>
            <span>${ROLE_LABELS[member.role]}<small>${member.shift === "day" ? "Jour" : "Nuit"}</small></span>
            <span>${escapeHtml(member.status)}${member.compromised ? "<small class=\"status-danger\">risque interne</small>" : ""}</span>
            <span>${Math.round(member.needs.morale)}%</span>
            <span>${Math.round(member.needs.fatigue)}%</span>
            <span><button data-action="select-staff" data-staff="${member.id}">Voir</button><button data-action="train-staff" data-staff="${member.id}">Former</button><button data-action="vet-staff" data-staff="${member.id}">Vérifier</button></span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderScpManagement(state: GameState): string {
    return `
      <div class="management-header"><div><h2>Dossiers SCP</h2><p>Connaissance, cellule, risque et procédure de confinement.</p></div></div>
      <div class="scp-management-grid">
        ${state.scps.filter((scp) => scp.discovered).map((scp) => {
          const definition = getSCPDefinition(scp.definitionId);
          const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
          const room = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
          return `
            <article class="scp-management-card" style="--class-color:${objectClassColor(definition.objectClass)}">
              <header><strong>${definition.designation}</strong><span>${definition.objectClass}</span></header>
              <h3>${escapeHtml(definition.name)}</h3>
              <p>${escapeHtml(definition.description)}</p>
              ${renderMetricGrid([["Confiné", scp.contained ? "Oui" : "Non"], ["Risque", percent(scp.breachRisk)], ["Connaissance", percent(scp.knowledge)], ["Cellule", room ? `-${room.level + 1}` : "—"]])}
              <div class="action-row"><button data-action="open-procedure" data-scp="${scp.id}">Procédure v${procedure?.version ?? 1}</button>${!scp.contained ? `<button data-action="focus-scp" data-scp="${scp.id}">Transférer</button>` : ""}</div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderResearchManagement(state: GameState): string {
    return `
      <div class="management-header"><div><h2>Recherche</h2><p>${formatNumber(state.resources.research)} points disponibles. Les technologies déverrouillent de véritables capacités de construction et de procédure.</p></div></div>
      <div class="research-grid">
        ${state.researchNodes.map((node) => {
          const prerequisitesMet = node.prerequisites.every((id) => state.researchNodes.some((entry) => entry.id === id && entry.completed));
          return `<article class="research-card ${node.completed ? "completed" : prerequisitesMet ? "available" : "locked"}"><span>${escapeHtml(node.category)}</span><h3>${escapeHtml(node.name)}</h3><p>${escapeHtml(node.description)}</p><small>Coût ${node.cost} · Prérequis ${node.prerequisites.length || "aucun"}</small>${node.completed ? `<b>TERMINÉE</b>` : `<button data-action="research" data-node="${node.id}" ${prerequisitesMet ? "" : "disabled"}>Rechercher</button>`}</article>`;
        }).join("")}
      </div>
    `;
  }

  function renderCampaignManagement(state: GameState): string {
    if (state.mode === "sandbox") return `<div class="management-header"><div><h2>Bac à sable</h2><p>Tous les chapitres et dossiers sont autorisés. Les objectifs de campagne sont désactivés.</p></div></div>`;
    return `
      <div class="management-header"><div><h2>Directives de campagne</h2><p>Progression stratégique du mandat de directeur.</p></div></div>
      <div class="campaign-list">
        ${state.campaign.map((chapter) => `<article class="chapter-card ${chapter.complete ? "complete" : chapter.index === state.currentChapter ? "current" : chapter.index > state.currentChapter ? "locked" : ""}"><header><span>${chapter.index.toString().padStart(2, "0")}</span><div><h3>${escapeHtml(chapter.title)}</h3><p>${escapeHtml(chapter.briefing)}</p></div></header>${chapter.objectives.map((objective) => `<div class="objective-line ${objective.complete ? "complete" : ""}"><span>${objective.complete ? "✓" : "○"}</span><div><strong>${escapeHtml(objective.title)}</strong><small>${escapeHtml(objective.description)}</small></div><b>${round(objective.progress, 1)}/${objective.target}</b></div>`).join("")}</article>`).join("")}
      </div>
    `;
  }

  function renderReports(state: GameState): string {
    return `
      <div class="management-header"><div><h2>Rapports et journal</h2><p>Reconstitution des événements, décisions et incidents du Site.</p></div></div>
      <div class="reports-layout">
        <section><h3>Historique opérationnel</h3><div class="report-log">${state.history.map((line) => `<p>${escapeHtml(line)}</p>`).join("") || "<p>Aucun rapport.</p>"}</div></section>
        <section><h3>Notifications</h3><div class="report-log">${state.notifications.map((note) => `<p><b>${escapeHtml(note.title)}</b><br>${escapeHtml(note.message)}</p>`).join("")}</div></section>
      </div>
    `;
  }

  function renderSettings(state: GameState): string {
    return `
      <div class="management-header"><div><h2>Sauvegarde et paramètres</h2><p>La sauvegarde automatique s'effectue toutes les six heures de jeu.</p></div></div>
      <div class="settings-grid">
        <section><h3>Partie</h3><button class="wide-button" data-action="save">Sauvegarder</button><button class="wide-button" data-action="load">Charger</button><button class="wide-button" data-action="export">Exporter en JSON</button><button class="wide-button" data-action="import">Importer une sauvegarde</button><button class="wide-button danger" data-action="new-game">Nouvelle partie</button></section>
        <section><h3>Accessibilité</h3>${renderToggle("audio", "Audio procédural", state.settings.audio)}${renderToggle("auto-pause", "Pause automatique critique", state.settings.autoPauseCritical)}${renderToggle("reduced-motion", "Mouvements réduits", state.settings.reducedMotion)}${renderToggle("high-contrast", "Contraste renforcé", state.settings.highContrast)}${renderToggle("tutorial", "Conseils contextuels", state.settings.tutorial)}</section>
        <section><h3>Informations</h3><p>Version ${GAME_VERSION}</p><p>Graine ${state.seed}</p><p>Difficulté ${state.settings.difficulty}</p><p>Mode ${state.mode}</p><button class="wide-button" data-action="credits">Attribution et licence</button></section>
      </div>
    `;
  }

  function renderToggle(key: string, label: string, checked: boolean): string {
    return `<label class="toggle-row"><span>${escapeHtml(label)}</span><input type="checkbox" data-setting="${key}" ${checked ? "checked" : ""}><i></i></label>`;
  }

  function updateNotifications(state: GameState): void {
    const badge = document.getElementById("notification-count");
    const unread = state.notifications.filter((note) => !note.read).length;
    if (badge) {
      badge.textContent = String(unread);
      badge.classList.toggle("hidden", unread === 0);
    }
  }

  function updateModal(runtime: RuntimeState): void {
    const root = document.getElementById("modal-root");
    if (!root) return;
    const state = runtime.state;
    const currentEvent = state.currentEventId ? state.events.find((entry) => entry.id === state.currentEventId && !entry.resolved) : undefined;
    if (currentEvent) modalMode = "event";
    if (modalMode === "none") {
      setPageInert(false);
      root.classList.add("hidden");
      if (root.innerHTML) root.innerHTML = "";
      if (renderedModalKey) {
        const target = modalReturnFocus?.isConnected ? modalReturnFocus
          : modalReturnFocusSignature ? findFocusTarget(document.body, modalReturnFocusSignature) : undefined;
        target?.focus({ preventScroll: true });
      }
      modalReturnFocus = undefined;
      modalReturnFocusSignature = undefined;
      renderedModalKey = "";
      return;
    }
    setPageInert(true);
    root.classList.remove("hidden");
    root.tabIndex = -1;
    const modalKey = modalMode === "surface-access" ? `surface-access:${accessEditorRoomId}:${accessEditorAccessId}` : modalMode === "event" && currentEvent ? `event:${currentEvent.id}` : modalMode === "procedure" ? `procedure:${procedureScpId}:${state.procedures.find((procedure) => procedure.scpId === procedureScpId || state.scps.find((scp) => scp.id === procedureScpId)?.procedureId === procedure.id)?.version ?? 0}` : modalMode;
    if (modalKey === renderedModalKey) return;
    if (modalMode === "event" && currentEvent) root.innerHTML = renderEventModal(state, currentEvent);
    else if (modalMode === "surface-access") { root.innerHTML = renderSurfaceAccessModal(state); updateSurfaceAccessForm(state); }
    else if (modalMode === "procedure") root.innerHTML = renderProcedureModal(state, procedureScpId);
    else if (modalMode === "import") root.innerHTML = renderImportModal();
    else if (modalMode === "new-game") root.innerHTML = renderNewGameModal();
    else if (modalMode === "help") root.innerHTML = renderHelpModal();
    else if (modalMode === "credits") root.innerHTML = renderCreditsModal();
    else {
      modalMode = "none";
      root.classList.add("hidden");
      renderedModalKey = "";
      return;
    }
    renderedModalKey = modalKey;
    root.setAttribute("aria-labelledby", root.querySelector("h2")?.id || "modal-title");
    window.setTimeout(() => (root.querySelector<HTMLElement>("button, input, select, textarea") ?? root).focus?.(), 0);
  }

  function renderEventModal(state: GameState, event: GameEvent): string {
    return `<div class="modal-card event-modal ${event.severity}"><header><span>${event.severity.toUpperCase()}</span><h2 id="modal-title">${escapeHtml(event.title)}</h2></header><p>${escapeHtml(event.body)}</p><div class="event-choices">${event.choices.map((choice) => `<button data-action="event-choice" data-event="${event.id}" data-choice="${choice.id}"><strong>${escapeHtml(choice.label)}</strong><span>${escapeHtml(choice.description)}</span>${choice.cost ? `<small>${escapeHtml(costToString(choice.cost))}</small>` : ""}</button>`).join("")}</div></div>`;
  }

  function renderProcedureModal(state: GameState, scpId: string): string {
    const scp = state.scps.find((entry) => entry.id === scpId || entry.definitionId === scpId);
    if (!scp) return `<div class="modal-card"><p>Dossier introuvable.</p><button data-action="close-modal">Fermer</button></div>`;
    const definition = getSCPDefinition(scp.definitionId);
    const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
    if (!procedure) return `<div class="modal-card"><p>Procédure introuvable.</p><button data-action="close-modal">Fermer</button></div>`;
    const requiredStaff = Object.values(definition.requirements.staff).reduce((sum, count) => sum + (count ?? 0), 0);
    const minimumTraining = clamp(18 + definition.risk * 4, 20, 78);
    const assignedActual = state.undergroundRooms.find((room) => room.id === scp.roomId)?.staffAssigned.length ?? 0;
    return `
      <div class="modal-card procedure-modal">
        <header><div><span>PROCÉDURE v${procedure.version}</span><h2 id="modal-title">${definition.designation} — ${escapeHtml(definition.name)}</h2></div><button data-action="close-modal" aria-label="Fermer">×</button></header>
        <p>${escapeHtml(definition.uniqueRule)}</p>
        <div class="procedure-layout">
          <section>
            ${renderRange("observationLevel", "Niveau d'observation", procedure.observationLevel)}
            ${renderRange("assignedStaff", "Effectif prévu", procedure.assignedStaff, requiredStaff, Math.min(18, requiredStaff + 3))}
            ${renderRange("maintenanceFrequency", "Fréquence de maintenance", procedure.maintenanceFrequency, 20, 100)}
            ${renderRange("trainingRequired", "Formation exigée", procedure.trainingRequired, minimumTraining, 100)}
            ${renderMetricGrid([["Effectif réel", `${assignedActual} / ${procedure.assignedStaff}`], ["Complexité calculée", percent(procedure.complexity)]])}
          </section>
          <section class="procedure-checks">
            ${procedureCheck(state, "backupPower", "Alimentation de secours", procedure.backupPower)}
            ${procedureCheck(state, "analogBackup", "Sauvegarde analogique", procedure.analogBackup)}
            ${procedureCheck(state, "biometricMonitoring", "Suivi biométrique", procedure.biometricMonitoring)}
            ${procedureCheck(state, "opticalMonitoring", "Surveillance optique", procedure.opticalMonitoring)}
            ${procedureCheck(state, "automatedLockdown", "Verrouillage automatique", procedure.automatedLockdown)}
            ${procedureCheck(state, "humaneCare", "Conditions coopératives", procedure.humaneCare)}
            ${procedureCheck(state, "restrictedTesting", "Tests strictement autorisés", procedure.restrictedTesting)}
            ${procedureCheck(state, "isolatedNetwork", "Réseau isolé", procedure.isolatedNetwork)}
            ${procedureCheck(state, "redundantVentilation", "Ventilation redondante", procedure.redundantVentilation)}
          </section>
        </div>
        <label class="notes-field">Notes et addenda<textarea id="procedure-notes">${escapeHtml(procedure.notes)}</textarea></label>
        <footer><div>${renderProgressMetric("Conformité actuelle", evaluateProcedureCompliance(state, scp))}</div><button data-action="save-procedure" data-scp="${scp.id}">Enregistrer la nouvelle version</button></footer>
      </div>
    `;
  }

  function renderRange(key: keyof ProcedureState, label: string, value: number, min = 0, max = 100): string {
    return `<label class="range-row"><span>${escapeHtml(label)} <b data-range-value="${String(key)}">${Math.round(value)}</b></span><input type="range" min="${min}" max="${max}" value="${value}" data-procedure-range="${String(key)}"></label>`;
  }

  function procedureCheck(state: GameState, key: keyof ProcedureState, label: string, checked: boolean): string {
    const unlocked = isProcedureOptionUnlocked(state, key);
    const unlock = getProcedureOptionUnlock(key);
    const research = state.researchNodes.find((node) => unlock && node.unlocks.includes(unlock));
    const lockedLabel = unlocked ? "" : ` — recherche : ${research?.name ?? unlock}`;
    return `<label title="${escapeHtml(lockedLabel)}"><input type="checkbox" data-procedure-check="${String(key)}" ${checked ? "checked" : ""} ${unlocked ? "" : "disabled"}><span>${escapeHtml(label)}${unlocked ? "" : `<small>${escapeHtml(lockedLabel)}</small>`}</span></label>`;
  }

  function renderImportModal(): string {
    return `<div class="modal-card"><header><h2 id="modal-title">Importer une sauvegarde</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><p>Sélectionnez un fichier JSON exporté par le jeu.</p><button class="wide-button" data-action="choose-import">Choisir le fichier</button></div>`;
  }

  function renderNewGameModal(): string {
    return `<div class="modal-card new-game-modal"><header><h2 id="modal-title">Nouvelle direction de Site</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><label>Mode<select id="new-mode"><option value="campaign">Campagne Deep Protocol</option><option value="sandbox">Bac à sable complet</option></select></label><label>Difficulté<select id="new-difficulty"><option value="story">Narratif</option><option value="standard" selected>Standard</option><option value="director">Directeur</option><option value="keter">Keter</option></select></label><p>La partie actuelle reste disponible seulement si vous la sauvegardez avant de recommencer.</p><button class="wide-button danger" data-action="confirm-new-game">Créer le Site</button></div>`;
  }

  function renderHelpModal(): string {
    return `<div class="modal-card help-modal"><header><h2 id="modal-title">Manuel opérationnel</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><div class="help-grid"><section><h3>1. Région</h3><p>Construisez une couverture cohérente, sécurisez les accès et produisez énergie, eau et fournitures.</p></section><section><h3>2. Surface</h3><p>Placez les salles, maîtrisez les files et évitez que le personnel épuisé compromette les opérations.</p></section><section><h3>3. Sous-sol</h3><p>Construisez une cellule adaptée, transférez le SCP puis révisez sa procédure selon les risques réels.</p></section><section><h3>4. Crise</h3><p>Sélectionnez une zone et combinez verrouillage, évacuation, sécurité, FTM, énergie et décontamination.</p></section></div><p><kbd>1</kbd> Région · <kbd>2</kbd> Surface · <kbd>3</kbd> Sous-sol · <kbd>4</kbd> Commandement · <kbd>5</kbd> Gestion · <kbd>Espace</kbd> Pause · <kbd>Échap</kbd> Annuler</p><button class="wide-button" data-action="credits">Attribution et licence</button></div>`;
  }

  function renderCreditsModal(): string {
    return `<div class="modal-card help-modal"><header><h2 id="modal-title">Attribution et licence</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><p>SCP Foundation: Site Director est une adaptation non officielle de l'univers SCP Foundation. Le jeu, son code, ses textes dérivés et ses assets originaux sont distribués sous Creative Commons Attribution-ShareAlike 3.0.</p><div class="help-grid"><section><h3>Sources SCP</h3><p>Contenus de référence issus du SCP Wiki pour SCP-008, SCP-049, SCP-087, SCP-096, SCP-106, SCP-131, SCP-173, SCP-294, SCP-682, SCP-914, SCP-939 et SCP-999. Les auteurs et liens détaillés restent disponibles hors ligne.</p></section><section><h3>Assets</h3><p>Aucun visuel officiel du wiki SCP n'est copié. L'interface, les symboles, les rendus Canvas et l'audio sont originaux ou générés procéduralement pour ce jeu.</p></section></div><p><a href="./ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">Attributions détaillées</a> · <a href="./LICENSE.md" target="_blank" rel="noopener noreferrer">Avis de licence</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">Texte CC BY-SA 3.0</a> · <a href="https://github.com/darknigthmare/scp-foundation-site-director" target="_blank" rel="noopener noreferrer">Code source</a></p></div>`;
  }

  function updateEndScreen(state: GameState): void {
    const root = document.getElementById("end-screen");
    if (!root) return;
    if (!state.gameOver && !state.victory) {
      root.classList.add("hidden");
      if (root.innerHTML) root.innerHTML = "";
      renderedEndScreenKey = "";
      setPageInert(modalMode !== "none");
      return;
    }
    const key = state.victory ? "victory" : "game-over";
    if (renderedEndScreenKey === key) return;
    root.classList.remove("hidden");
    root.innerHTML = `<div><span>${state.victory ? "MANDAT ACCOMPLI" : "DIRECTION RÉVOQUÉE"}</span><h1>${state.victory ? "SITE DEEP PROTOCOL" : "RUPTURE DU VOILE"}</h1><p>${state.victory ? "Votre installation est devenue un modèle régional capable de contenir les menaces terminales." : "Le Site ne peut plus poursuivre son activité sous cette couverture."}</p>${state.victory ? `<button data-action="continue-after-victory">Continuer le Site</button>` : ""}<button data-action="new-game">Nouvelle partie</button><button data-action="load">Charger</button></div>`;
    renderedEndScreenKey = key;
    setPageInert(modalMode !== "none");
  }

  function handleDelegatedClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action], button[data-view], [data-speed]");
    if (!target || !activeRuntime) return;
    const runtime = activeRuntime;
    const state = runtime.state;

    if (target.dataset.view) {
      setView(state, target.dataset.view as ViewMode);
      runtime.uiDirty = true;
      refreshUI(runtime, true);
      return;
    }
    if (target.dataset.speed !== undefined) {
      setSpeed(state, Number(target.dataset.speed) as GameSpeed);
      runtime.uiDirty = true;
      return;
    }

    const action = target.dataset.action;
    if (!action) return;
    if (["help", "open-procedure", "import", "new-game", "credits", "add-access", "edit-access"].includes(action)) prepareModal(state, target);
    let result: { ok: boolean; message: string } | undefined;

    switch (action) {
      case "pause": togglePause(state); break;
      case "help": modalMode = "help"; break;
      case "close-modal": closeModal(state); break;
      case "toggle-panel": {
        const panel = document.getElementById("right-panel");
        const open = !panel?.classList.contains("mobile-open");
        panel?.classList.toggle("mobile-open", open);
        target.setAttribute("aria-expanded", String(open));
        target.textContent = open ? "Masquer" : "Détails";
        break;
      }
      case "build": startBuild(state, target.dataset.layer as Layer, target.dataset.type as BuildType); break;
      case "cancel-build": cancelBuild(state); break;
      case "upgrade-selected": result = upgradeSelected(state); break;
      case "repair-selected": result = repairSelected(state); break;
      case "demolish-selected": result = demolishSelected(state); break;
      case "add-access":
      case "edit-access":
        accessEditorRoomId = String(target.dataset.room);
        accessEditorAccessId = action === "edit-access" ? String(target.dataset.access) : "";
        modalMode = "surface-access";
        break;
      case "save-access":
        event.preventDefault();
        result = saveSurfaceAccessFromModal(state);
        break;
      case "toggle-access":
      case "toggle-access-power":
      case "toggle-access-air": {
        const room = state.surfaceRooms.find((entry) => entry.id === target.dataset.room);
        const access = room ? getSurfaceAccesses(state, room).find((entry) => entry.id === target.dataset.access) : undefined;
        if (!room || !access) result = { ok: false, message: "Passage introuvable." };
        else {
          const key = action === "toggle-access" ? "enabled" : action === "toggle-access-power" ? "powered" : "airSupply";
          result = updateSurfaceAccess(state, room.id, access.id, { ...access, [key]: !access[key] });
        }
        break;
      }
      case "remove-access": result = removeSurfaceAccess(state, String(target.dataset.room), String(target.dataset.access)); break;
      case "toggle-underground-seal": {
        const room = state.undergroundRooms.find((entry) => entry.id === target.dataset.room);
        result = room ? setUndergroundSeal(state, room.id, !room.sealed)
          : { ok: false, message: "Module souterrain introuvable." };
        break;
      }
      case "evacuate-access": result = evacuateSurfaceAccessAction(state, String(target.dataset.room), String(target.dataset.access)); break;
      case "select-staff": {
        state.selectedId = target.dataset.staff;
        state.selectedType = "staff";
        state.view = "surface";
        break;
      }
      case "hire-staff": result = hireStaff(state, target.dataset.role as StaffRole); break;
      case "train-staff": result = trainStaff(state, String(target.dataset.staff)); break;
      case "set-shift": result = setStaffShift(state, String(target.dataset.staff), target.dataset.shift === "night" ? "night" : "day"); break;
      case "vet-staff": result = vetStaff(state, String(target.dataset.staff)); break;
      case "dismiss-staff": result = dismissStaff(state, String(target.dataset.staff)); break;
      case "research": result = researchNode(state, String(target.dataset.node)); break;
      case "transfer-scp": result = transferSCP(state, String(target.dataset.scp), String(target.dataset.room)); break;
      case "focus-scp": focusSCPForTransfer(state, String(target.dataset.scp)); break;
      case "open-procedure": procedureScpId = String(target.dataset.scp); modalMode = "procedure"; break;
      case "save-procedure": result = saveProcedureFromModal(state, String(target.dataset.scp)); if (result.ok) closeModal(state); break;
      case "event-choice": result = resolveEventChoice(state, String(target.dataset.event), String(target.dataset.choice)); modalMode = "none"; modalPausedGame = false; break;
      case "management-tab": state.flags["management-tab"] = String(target.dataset.tab); break;
      case "crisis-order": result = issueCrisisOrder(state, target.dataset.order as CrisisOrderType, String(target.dataset.zone)); break;
      case "select-zone": state.selectedId = String(target.dataset.zone); state.selectedType = "zone"; break;
      case "resume-crisis": togglePause(state); break;
      case "start-drill": startCrisis(state, String(target.dataset.drill)); break;
      case "ack-crisis": state.crisis = createEmptyCrisis(); break;
      case "save": result = { ok: saveGame(state), message: "Sauvegarde locale enregistrée." }; break;
      case "load": {
        const loaded = loadLatestGame();
        if (loaded) { runtime.state = loaded; activeRuntime.state = loaded; hideStartScreen(); result = { ok: true, message: "Sauvegarde chargée." }; }
        else result = { ok: false, message: "Aucune sauvegarde disponible." };
        break;
      }
      case "export": exportSave(state); result = { ok: true, message: "Sauvegarde exportée." }; break;
      case "import": modalMode = "import"; break;
      case "choose-import": document.getElementById("import-file")?.click(); break;
      case "new-game": modalMode = "new-game"; break;
      case "confirm-new-game": createGameFromModal(runtime); break;
      case "continue-after-victory": continueAfterVictory(state); break;
      case "credits": modalMode = "credits"; break;
      case "open-notifications": openNotifications(state); break;
    }

    if (result) showToast(result.message, result.ok ? "success" : "error");
    runtime.uiDirty = true;
    refreshUI(runtime, true);
  }

  function handleDelegatedChange(event: Event): void {
    if (!activeRuntime) return;
    const input = event.target as HTMLInputElement;
    if (input.closest("#surface-access-form")) {
      if (input.id === "access-side") {
        const room = activeRuntime.state.surfaceRooms.find((entry) => entry.id === accessEditorRoomId);
        const offset = document.getElementById("access-offset") as HTMLInputElement | null;
        if (room && offset) offset.value = String(clamp(Number(offset.value) || 1, 1, input.value === "north" || input.value === "south" ? room.width : room.height));
      }
      updateSurfaceAccessForm(activeRuntime.state);
      return;
    }
    if (!input.dataset.setting) return;
    const state = activeRuntime.state;
    const key = input.dataset.setting;
    if (key === "audio") state.settings.audio = input.checked;
    if (key === "auto-pause") state.settings.autoPauseCritical = input.checked;
    if (key === "reduced-motion") state.settings.reducedMotion = input.checked;
    if (key === "high-contrast") { state.settings.highContrast = input.checked; document.body.classList.toggle("high-contrast", input.checked); }
    if (key === "tutorial") state.settings.tutorial = input.checked;
    activeRuntime.uiDirty = true;
    activeRuntime.canvasDirty = true;
  }

  function handleDelegatedInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.closest("#surface-access-form") && activeRuntime) { updateSurfaceAccessForm(activeRuntime.state); return; }
    const key = input.dataset.procedureRange;
    if (!key) return;
    const label = document.querySelector<HTMLElement>(`[data-range-value="${key}"]`);
    if (label) label.textContent = input.value;
  }

  function handleKeyboard(event: KeyboardEvent): void {
    if (!activeRuntime) return;
    const state = activeRuntime.state;
    if (modalMode !== "none") {
      if (event.key === "Tab") trapModalFocus(event);
      else if (event.key === "Escape" && modalMode !== "event") {
        event.preventDefault();
        closeModal(state);
        activeRuntime.uiDirty = true;
        refreshUI(activeRuntime, true);
      }
      return;
    }
    if (!document.getElementById("start-screen")?.classList.contains("hidden")) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [contenteditable='true']")) return;
    const views: Record<string, ViewMode> = { "1": "region", "2": "surface", "3": "underground", "4": "command", "5": "management" };
    let handled = true;
    if (views[event.key]) setView(state, views[event.key]);
    else if (event.code === "Space") { event.preventDefault(); togglePause(state); }
    else if (event.key === "Escape") cancelBuild(state);
    else if (event.key === "+" || event.key === "=") setSpeed(state, Math.min(4, state.speed === 0 ? 1 : state.speed * 2) as GameSpeed);
    else if (event.key === "-") setSpeed(state, Math.max(0, state.speed / 2) as GameSpeed);
    else handled = false;
    if (!handled) return;
    activeRuntime.uiDirty = true;
    refreshUI(activeRuntime, true);
  }

  function trapModalFocus(event: KeyboardEvent): void {
    const root = document.getElementById("modal-root");
    if (!root) return;
    const focusable = Array.from(root.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"))
      .filter((element) => !element.classList.contains("hidden"));
    if (focusable.length === 0) {
      event.preventDefault();
      root.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !activeRuntime) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = importSave(String(reader.result ?? ""));
      if (imported && activeRuntime) {
        activeRuntime.state = imported;
        modalMode = "none";
        modalPausedGame = false;
        showToast("Sauvegarde importée.", "success");
        refreshUI(activeRuntime, true);
      } else showToast("Fichier incompatible.", "error");
    };
    reader.readAsText(file);
    input.value = "";
  }

  function saveProcedureFromModal(state: GameState, scpId: string): { ok: boolean; message: string } {
    const updates: Partial<ProcedureState> = {};
    document.querySelectorAll<HTMLInputElement>("[data-procedure-range]").forEach((input) => {
      const key = input.dataset.procedureRange as keyof ProcedureState;
      (updates as Record<string, unknown>)[key] = Number(input.value);
    });
    document.querySelectorAll<HTMLInputElement>("[data-procedure-check]").forEach((input) => {
      const key = input.dataset.procedureCheck as keyof ProcedureState;
      (updates as Record<string, unknown>)[key] = input.checked;
    });
    const notes = document.getElementById("procedure-notes") as HTMLTextAreaElement | null;
    updates.notes = notes?.value ?? "";
    return updateProcedure(state, scpId, updates);
  }

  function focusSCPForTransfer(state: GameState, scpId: string): void {
    const scp = state.scps.find((entry) => entry.id === scpId);
    if (!scp) return;
    const room = getCompatibleRooms(state, scp).find((entry) => !entry.scpId);
    state.view = "underground";
    if (room) {
      state.selectedId = room.id;
      state.selectedType = "underground-room";
    } else {
      const definition = getSCPDefinition(scp.definitionId);
      showToast(`Construisez une cellule avec : ${definition.requirements.roomTags.join(", ")}.`, "error");
    }
  }

  function createGameFromModal(runtime: RuntimeState): void {
    const mode = (document.getElementById("new-mode") as HTMLSelectElement | null)?.value as "campaign" | "sandbox";
    const difficulty = (document.getElementById("new-difficulty") as HTMLSelectElement | null)?.value as Difficulty;
    runtime.state = createNewGame(mode || "campaign", difficulty || "standard");
    modalMode = "none";
    modalPausedGame = false;
    hideStartScreen();
    showToast("Nouveau Site créé.", "success");
  }

  function openNotifications(state: GameState): void {
    state.notifications.forEach((note) => note.read = true);
    state.flags["management-tab"] = "reports";
    state.view = "management";
  }

  export function showToast(message: string, type: "success" | "error" | "info" = "info"): void {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} visible`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    window.setTimeout(() => toast.classList.remove("visible"), type === "error" ? 6000 : 3200);
  }

  function setText(id: string, value: string): void {
    const element = document.getElementById(id);
    if (element && element.textContent !== value) element.textContent = value;
  }
}

