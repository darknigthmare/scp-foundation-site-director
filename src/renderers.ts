namespace SCPGame {
  const SURFACE_COLORS: Record<SurfaceRoomType, string> = {
    corridor: "#303842",
    reception: "#557c80",
    checkpoint: "#78585c",
    administration: "#59687d",
    "access-office": "#675d7f",
    archive: "#554f69",
    medical: "#52786b",
    quarantine: "#7a6642",
    decontamination: "#47777c",
    intake: "#765b45",
    laboratory: "#466a83",
    research: "#4d6386",
    "staff-room": "#5e7158",
    canteen: "#7c6b49",
    restroom: "#536a73",
    maintenance: "#735c3e",
    warehouse: "#665c50",
    armory: "#70474b",
    briefing: "#62617a",
    "command-center": "#69485d",
    training: "#5c6b54",
    "mtf-bay": "#78454f",
    "waste-processing": "#5e6550",
    "power-distribution": "#7a7040",
    elevator: "#3f5966"
  };

  const UNDERGROUND_COLORS: Record<UndergroundRoomType, string> = {
    excavated: "#49443d",
    "elevator-shaft": "#3f5561",
    "service-tunnel": "#4c5358",
    "safe-containment": "#4e745f",
    "euclid-containment": "#74673f",
    "keter-containment": "#783f45",
    "humanoid-cell": "#596b72",
    "bio-containment": "#4f735f",
    "infohazard-vault": "#5f4e75",
    "heavy-containment": "#5f5555",
    "research-lab": "#435f78",
    "security-post": "#70464b",
    "medical-bay": "#4e715f",
    "power-node": "#766f42",
    "air-filtration": "#426c72",
    "emergency-shelter": "#59674f",
    "acid-system": "#64743d",
    "temporal-lock": "#654d76"
  };

  const REGION_COLORS: Record<RegionFacilityType, string> = {
    "cover-office": "#647587",
    road: "#4d5258",
    parking: "#585d63",
    "power-plant": "#766d45",
    "water-treatment": "#476d76",
    "supply-depot": "#695b4f",
    housing: "#5f735d",
    helipad: "#5e6168",
    "rail-terminal": "#5e554f",
    "public-clinic": "#527568",
    "data-center": "#4f6479",
    checkpoint: "#744b50",
    watchtower: "#63585a",
    "green-zone": "#4e704d"
  };

  export function resizeCanvas(runtime: RuntimeState): void {
    const rect = runtime.canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(320, Math.floor(rect.width * ratio));
    const height = Math.max(260, Math.floor(rect.height * ratio));
    if (runtime.canvas.width !== width || runtime.canvas.height !== height) {
      runtime.canvas.width = width;
      runtime.canvas.height = height;
      runtime.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  }

  export function renderCanvas(runtime: RuntimeState): void {
    resizeCanvas(runtime);
    const ctx = runtime.context;
    const rect = runtime.canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawBackdrop(ctx, rect.width, rect.height, runtime.state.view);
    switch (runtime.state.view) {
      case "region": drawRegion(runtime, rect.width, rect.height); break;
      case "surface": drawSurface(runtime, rect.width, rect.height); break;
      case "underground": drawUnderground(runtime, rect.width, rect.height); break;
      case "command": drawCommand(runtime, rect.width, rect.height); break;
      case "management": drawManagementBackdrop(runtime, rect.width, rect.height); break;
    }
  }

  function drawBackdrop(ctx: CanvasRenderingContext2D, width: number, height: number, view: ViewMode): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (view === "region") {
      gradient.addColorStop(0, "#19252a");
      gradient.addColorStop(1, "#101719");
    } else if (view === "underground") {
      gradient.addColorStop(0, "#16171a");
      gradient.addColorStop(1, "#090a0c");
    } else {
      gradient.addColorStop(0, "#151b20");
      gradient.addColorStop(1, "#0d1114");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 28) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 28) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
  }

  function regionMetrics(runtime: RuntimeState, width: number): { tileW: number; tileH: number; originX: number; originY: number } {
    const camera = runtime.state.camera.region;
    const tileW = Math.max(26, Math.min(54, width / 15)) * camera.zoom;
    const tileH = tileW * 0.48;
    return {
      tileW,
      tileH,
      originX: width * 0.5 + camera.offsetX,
      originY: 54 + camera.offsetY
    };
  }

  function regionToScreen(runtime: RuntimeState, width: number, x: number, y: number): Point {
    const metrics = regionMetrics(runtime, width);
    return {
      x: metrics.originX + (x - y) * metrics.tileW * 0.5,
      y: metrics.originY + (x + y) * metrics.tileH * 0.5
    };
  }

  export function screenToRegionCell(runtime: RuntimeState, clientX: number, clientY: number): Point {
    const rect = runtime.canvas.getBoundingClientRect();
    const metrics = regionMetrics(runtime, rect.width);
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const dx = (localX - metrics.originX) / (metrics.tileW * 0.5);
    const dy = (localY - metrics.originY) / (metrics.tileH * 0.5);
    return { x: Math.floor((dx + dy) / 2), y: Math.floor((dy - dx) / 2) };
  }

  function drawDiamond(ctx: CanvasRenderingContext2D, center: Point, tileW: number, tileH: number, fill: string, stroke = "rgba(255,255,255,.12)"): void {
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + tileW / 2, center.y + tileH / 2);
    ctx.lineTo(center.x, center.y + tileH);
    ctx.lineTo(center.x - tileW / 2, center.y + tileH / 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  function drawRegion(runtime: RuntimeState, width: number, height: number): void {
    const state = runtime.state;
    const ctx = runtime.context;
    const metrics = regionMetrics(runtime, width);
    const hover = runtime.hoveredCell;

    for (let y = 0; y < state.regionHeight; y += 1) {
      for (let x = 0; x < state.regionWidth; x += 1) {
        const point = regionToScreen(runtime, width, x, y);
        const noise = Math.sin(x * 1.71 + y * 2.31) * 0.03;
        const color = y < 2 ? `rgba(48,71,69,${0.78 + noise})` : `rgba(48,67,55,${0.78 + noise})`;
        drawDiamond(ctx, point, metrics.tileW, metrics.tileH, color);
      }
    }

    drawRegionalCity(ctx, runtime, width, height);

    const facilities = [...state.regionFacilities].sort((a, b) => (a.x + a.y) - (b.x + b.y));
    facilities.forEach((facility) => drawRegionFacility(ctx, runtime, facility, width));
    drawRegionSiteCampus(runtime, width);

    if (hover && state.view === "region") {
      const point = regionToScreen(runtime, width, hover.x, hover.y);
      const valid = hover.x >= 0 && hover.y >= 0 && hover.x < state.regionWidth && hover.y < state.regionHeight;
      drawDiamond(ctx, point, metrics.tileW, metrics.tileH, valid ? "rgba(106,210,175,.22)" : "rgba(230,92,92,.22)", valid ? "#72d2b0" : "#e05c5c");
    }

    drawCanvasTitle(ctx, "RÉGION ET SITE", "Vue extérieure : ville, annexes et toitures du même complexe intérieur", width);
    drawLegend(ctx, width, height, [
      ["Couverture", Math.round(state.reputation.cover), "#73c9a3"],
      ["Suspicion", Math.round(state.reputation.suspicion), "#e58b65"],
      ["Installations", state.regionFacilities.length, "#9ab7cf"]
    ]);
  }

  function drawRegionSiteCampus(runtime: RuntimeState, width: number): void {
    const state = runtime.state;
    const ctx = runtime.context;
    const bounds = getSiteRegionFootprint(state);
    const metrics = regionMetrics(runtime, width);
    const polygon = (x: number, y: number, w: number, h: number): void => {
      const a = regionToScreen(runtime, width, x, y);
      const b = regionToScreen(runtime, width, x + w, y);
      const c = regionToScreen(runtime, width, x + w, y + h);
      const d = regionToScreen(runtime, width, x, y + h);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath();
    };

    // Exterior shell and roofs are 100% derived from the current surface-room
    // collection: building/removing a room immediately updates its roof.
    ctx.save();
    polygon(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fillStyle = "rgba(11,24,31,.96)";
    ctx.strokeStyle = "rgba(104,221,194,.95)";
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();

    const rooms = [...state.surfaceRooms].sort((a, b) =>
      (a.type === "corridor" ? -1 : 0) - (b.type === "corridor" ? -1 : 0));
    for (const room of rooms) {
      const roof = getSurfaceRegionFootprint(state, room);
      const selected = state.selectedType === "surface-room" && state.selectedId === room.id;
      polygon(roof.x, roof.y, roof.width, roof.height);
      ctx.fillStyle = room.type === "corridor" ? "rgba(80,95,103,.85)" : SURFACE_COLORS[room.type];
      ctx.globalAlpha = room.enabled ? 0.87 : 0.28;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = selected ? "#fff1a5" : "rgba(227,241,237,.34)";
      ctx.lineWidth = selected ? 2.5 : 0.7;
      ctx.stroke();
      if (selected || room.type === "elevator") {
        const center = regionToScreen(runtime, width, roof.x + roof.width / 2, roof.y + roof.height / 2);
        ctx.fillStyle = selected ? "#fff1a5" : "#d0e7fa";
        ctx.font = "700 12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(selected ? getSurfaceDefinition(room.type).name : "⇩", center.x, center.y - 5);
      }
    }
    const label = regionToScreen(runtime, width, bounds.x + bounds.width / 2, bounds.y + bounds.height + 0.5);
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.font = "700 11px system-ui";
    ctx.fillStyle = "#bcebdc";
    ctx.fillText("SITE PRINCIPAL · TOITURES", label.x, label.y);
    ctx.font = "10px system-ui";
    ctx.fillStyle = "rgba(209,233,227,.82)";
    ctx.fillText(`${state.surfaceRooms.filter((room) => room.type !== "corridor").length} salles reliées au plan intérieur`, label.x, label.y + 13);
    // Three-scale reference: horizontal x is maintained in all projections.
    const section = getSiteSectionSurfaceY(state);
    const p1 = surfaceToRegionPosition(state, { x: 0, y: section });
    const p2 = surfaceToRegionPosition(state, { x: state.surfaceWidth, y: section });
    const a = regionToScreen(runtime, width, p1.x, p1.y);
    const b = regionToScreen(runtime, width, p2.x, p2.y);
    ctx.strokeStyle = "rgba(255,214,120,.8)";
    ctx.lineWidth = Math.max(1, metrics.tileW / 45);
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawRegionalCity(ctx: CanvasRenderingContext2D, runtime: RuntimeState, width: number, height: number): void {
    const metrics = regionMetrics(runtime, width);
    ctx.save();
    ctx.globalAlpha = 0.45;
    for (let index = 0; index < 14; index += 1) {
      const x = 1 + index % 6;
      const y = 9 + Math.floor(index / 6);
      const base = regionToScreen(runtime, width, x, y);
      const h = 8 + (index * 7 % 18);
      ctx.fillStyle = index % 3 === 0 ? "#4b5660" : "#414b50";
      ctx.fillRect(base.x - metrics.tileW * 0.15, base.y + metrics.tileH * 0.28 - h, metrics.tileW * 0.3, h);
      ctx.fillStyle = "rgba(240,210,124,.3)";
      ctx.fillRect(base.x - 3, base.y + metrics.tileH * 0.3 - h + 4, 2, 2);
      ctx.fillRect(base.x + 3, base.y + metrics.tileH * 0.3 - h + 8, 2, 2);
    }
    ctx.restore();
    if (width >= 620) {
      ctx.fillStyle = "rgba(220,229,233,.55)";
      ctx.font = "11px system-ui";
      ctx.fillText("AGGLOMÉRATION CIVILE", 18, height - 22);
    }
  }

  function drawRegionFacility(ctx: CanvasRenderingContext2D, runtime: RuntimeState, facility: RegionFacility, width: number): void {
    const state = runtime.state;
    const metrics = regionMetrics(runtime, width);
    const definition = getRegionDefinition(facility.type);
    const selected = state.selectedType === "facility" && state.selectedId === facility.id;
    const base = regionToScreen(runtime, width, facility.x + facility.width / 2 - 0.5, facility.y + facility.height / 2 - 0.5);
    const footprintW = metrics.tileW * (facility.width + facility.height) * 0.25;
    const footprintH = metrics.tileH * (facility.width + facility.height) * 0.25;
    const height3d = facility.type === "watchtower" ? 38 : facility.type === "power-plant" ? 30 : 18 + facility.level * 4;

    ctx.save();
    ctx.shadowColor = selected ? "rgba(118,220,188,.7)" : "rgba(0,0,0,.45)";
    ctx.shadowBlur = selected ? 14 : 7;
    ctx.fillStyle = REGION_COLORS[facility.type];
    ctx.fillRect(base.x - footprintW / 2, base.y + footprintH / 2 - height3d, footprintW, height3d);
    ctx.fillStyle = "rgba(255,255,255,.1)";
    ctx.fillRect(base.x - footprintW / 2, base.y + footprintH / 2 - height3d, footprintW, 4);
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.fillRect(base.x + footprintW * 0.25, base.y + footprintH / 2 - height3d + 5, footprintW * 0.12, height3d - 5);
    ctx.restore();

    ctx.strokeStyle = selected ? "#77dab7" : "rgba(255,255,255,.2)";
    ctx.strokeRect(base.x - footprintW / 2, base.y + footprintH / 2 - height3d, footprintW, height3d);
    ctx.textAlign = "center";
    ctx.fillStyle = "#edf3f2";
    ctx.font = "700 11px system-ui";
    ctx.fillText(definition.icon, base.x, base.y + footprintH / 2 - height3d / 2 + 4);
    if (width >= 620 || selected) {
      ctx.font = "10px system-ui";
      ctx.fillStyle = "rgba(234,241,241,.82)";
      ctx.fillText(definition.name, base.x, base.y + footprintH / 2 + 13);
    }
    ctx.textAlign = "left";

    if (facility.condition < 55) drawWarningBadge(ctx, base.x + footprintW / 2 - 5, base.y + footprintH / 2 - height3d - 4, "!");
  }

  function surfaceMetrics(runtime: RuntimeState, width: number, height: number): { cell: number; originX: number; originY: number } {
    const camera = runtime.state.camera.surface;
    const cell = Math.max(18, Math.min(38, Math.min(width / (runtime.state.surfaceWidth + 2), (height - 80) / (runtime.state.surfaceHeight + 2)))) * camera.zoom;
    return {
      cell,
      originX: (width - runtime.state.surfaceWidth * cell) / 2 + camera.offsetX,
      originY: 62 + camera.offsetY
    };
  }

  export function screenToSurfaceCell(runtime: RuntimeState, clientX: number, clientY: number): Point {
    const rect = runtime.canvas.getBoundingClientRect();
    const metrics = surfaceMetrics(runtime, rect.width, rect.height);
    return {
      x: Math.floor((clientX - rect.left - metrics.originX) / metrics.cell),
      y: Math.floor((clientY - rect.top - metrics.originY) / metrics.cell)
    };
  }

  function drawSurface(runtime: RuntimeState, width: number, height: number): void {
    const state = runtime.state;
    const ctx = runtime.context;
    const metrics = surfaceMetrics(runtime, width, height);
    const totalW = state.surfaceWidth * metrics.cell;
    const totalH = state.surfaceHeight * metrics.cell;

    ctx.fillStyle = "#1e252a";
    ctx.fillRect(metrics.originX - 7, metrics.originY - 7, totalW + 14, totalH + 14);
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= state.surfaceWidth; x += 1) {
      ctx.beginPath();
      ctx.moveTo(metrics.originX + x * metrics.cell, metrics.originY);
      ctx.lineTo(metrics.originX + x * metrics.cell, metrics.originY + totalH);
      ctx.stroke();
    }
    for (let y = 0; y <= state.surfaceHeight; y += 1) {
      ctx.beginPath();
      ctx.moveTo(metrics.originX, metrics.originY + y * metrics.cell);
      ctx.lineTo(metrics.originX + totalW, metrics.originY + y * metrics.cell);
      ctx.stroke();
    }

    [...state.surfaceRooms].sort((a, b) => a.type === "corridor" ? -1 : b.type === "corridor" ? 1 : 0).forEach((room) => drawSurfaceRoom(ctx, runtime, room, metrics));
    state.surfaceRooms.forEach((room) => drawSurfaceAccesses(ctx, runtime, room, metrics));
    drawSiteSurfaceSection(ctx, runtime, metrics);
    drawSurfaceStaff(ctx, runtime, metrics);

    if (runtime.hoveredCell) {
      const hover = runtime.hoveredCell;
      const build = state.buildSelection?.layer === "surface" ? getSurfaceDefinition(state.buildSelection.type as SurfaceRoomType) : undefined;
      const w = build?.minSize.x ?? 1;
      const h = build?.minSize.y ?? 1;
      const valid = hover.x >= 0 && hover.y >= 0 && hover.x + w <= state.surfaceWidth && hover.y + h <= state.surfaceHeight;
      ctx.fillStyle = valid ? "rgba(106,210,175,.2)" : "rgba(230,92,92,.2)";
      ctx.strokeStyle = valid ? "#73d4b2" : "#e05c5c";
      ctx.lineWidth = 2;
      ctx.fillRect(metrics.originX + hover.x * metrics.cell, metrics.originY + hover.y * metrics.cell, w * metrics.cell, h * metrics.cell);
      ctx.strokeRect(metrics.originX + hover.x * metrics.cell, metrics.originY + hover.y * metrics.cell, w * metrics.cell, h * metrics.cell);
    }

    drawCanvasTitle(ctx, "INTÉRIEUR DU SITE", "Même bâtiment que la vue Région · plan des pièces · coupe A-A vers le sous-sol", width);
    const queues = state.surfaceRooms.reduce((sum, room) => sum + room.queue.length
      + getSurfaceAccesses(state, room).reduce((waiting, access) => waiting + access.queue.length, 0), 0) + state.workItems.length;
    drawLegend(ctx, width, height, [
      ["Personnel", state.staff.filter((member) => member.status !== "dead").length, "#9ab7cf"],
      ["Files", queues, queues > 12 ? "#e36e68" : "#d5bd6a"],
      ["Énergie", Math.round(state.resources.power), "#d6c868"]
    ]);
  }

  function drawSiteSurfaceSection(ctx: CanvasRenderingContext2D, runtime: RuntimeState,
    metrics: { cell: number; originX: number; originY: number }): void {
    const state = runtime.state;
    const y = metrics.originY + (getSiteSectionSurfaceY(state) + 0.5) * metrics.cell;
    ctx.save();
    ctx.strokeStyle = "rgba(255,206,118,.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(metrics.originX, y);
    ctx.lineTo(metrics.originX + state.surfaceWidth * metrics.cell, y);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(13,22,27,.9)";
    ctx.fillRect(metrics.originX + 4, y - 21, 118, 16);
    ctx.fillStyle = "#ffdda0";
    ctx.font = "700 10px system-ui";
    ctx.fillText("COUPE SOUS-SOL A-A", metrics.originX + 9, y - 9);
    for (const portal of getUndergroundPortals(state)) {
      const center = undergroundXToSurfaceX(state, portal.shaft.x + portal.shaft.width / 2);
      const x = metrics.originX + center * metrics.cell;
      ctx.beginPath(); ctx.arc(x, y, Math.max(5, metrics.cell * 0.18), 0, Math.PI * 2);
      ctx.fillStyle = "#c5f7e5"; ctx.fill();
      ctx.strokeStyle = "#17353d"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#12323a";
      ctx.textAlign = "center"; ctx.font = "700 9px system-ui";
      ctx.fillText("⇅", x, y + 3);
    }
    ctx.textAlign = "left";
    ctx.restore();
  }

  function drawSurfaceRoom(ctx: CanvasRenderingContext2D, runtime: RuntimeState, room: SurfaceRoom, metrics: { cell: number; originX: number; originY: number }): void {
    const state = runtime.state;
    const definition = getSurfaceDefinition(room.type);
    const selected = state.selectedType === "surface-room" && state.selectedId === room.id;
    const x = metrics.originX + room.x * metrics.cell;
    const y = metrics.originY + room.y * metrics.cell;
    const w = room.width * metrics.cell;
    const h = room.height * metrics.cell;

    ctx.save();
    ctx.shadowColor = selected ? "rgba(116,221,186,.7)" : "rgba(0,0,0,.28)";
    ctx.shadowBlur = selected ? 12 : 4;
    ctx.fillStyle = SURFACE_COLORS[room.type];
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(x + 4, y + 4, w - 8, Math.max(3, metrics.cell * 0.12));
    ctx.strokeStyle = selected ? "#79d9b8" : room.condition < 45 ? "#dc6d65" : "rgba(230,238,239,.24)";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    const centerX = x + w / 2;
    const centerY = y + h / 2;
    ctx.textAlign = "center";
    ctx.fillStyle = "#f0f4f4";
    ctx.font = `${Math.max(9, Math.min(15, metrics.cell * 0.38))}px system-ui`;
    ctx.fillText(definition.icon, centerX, centerY - 2);
    if (w > 65 && h > 42) {
      ctx.font = `600 ${Math.max(8, Math.min(11, metrics.cell * 0.28))}px system-ui`;
      ctx.fillStyle = "rgba(244,248,248,.9)";
      const label = definition.name.length > 22 ? `${definition.name.slice(0, 20)}…` : definition.name;
      ctx.fillText(label, centerX, centerY + 14);
    }
    ctx.textAlign = "left";

    if (room.queue.length > 0) {
      drawPill(ctx, x + w - 19, y + 11, String(room.queue.length), room.queue.length > 5 ? "#d95e5e" : "#c99e55");
    }
    if (room.staffAssigned.length > 0 && w > 52) {
      drawPill(ctx, x + 18, y + h - 10, `${room.staffAssigned.length}👤`, "#526f84");
    }
    if (room.condition < 55 || room.cleanliness < 45) {
      drawWarningBadge(ctx, x + w - 8, y + h - 8, room.condition < 35 ? "!!" : "!");
    }
  }

  function drawSurfaceAccesses(ctx: CanvasRenderingContext2D, runtime: RuntimeState, room: SurfaceRoom, metrics: { cell: number; originX: number; originY: number }): void {
    if (room.type === "corridor") return;
    const state = runtime.state;
    const selected = state.selectedType === "surface-room" && state.selectedId === room.id;
    getSurfaceAccesses(state, room).forEach((access, index) => {
      const cells = getSurfaceAccessCells(room, access);
      const centerX = metrics.originX + ((cells.inside.x + cells.outside.x) / 2 + 0.5) * metrics.cell;
      const centerY = metrics.originY + ((cells.inside.y + cells.outside.y) / 2 + 0.5) * metrics.cell;
      const halfWidth = metrics.cell * 0.29;
      const depth = metrics.cell * 0.17;
      const angle = access.side === "north" ? 0 : access.side === "east" ? Math.PI / 2 : access.side === "south" ? Math.PI : -Math.PI / 2;
      const doorState = getSurfaceAccessDoorState(state, room, access);
      const failure = access.kind === "airlock" && (!access.powered || !access.airSupply || state.resources.power <= 1 || Boolean(state.flags["surface-blackout"]));
      const color = !access.enabled || failure ? "#ef8585" : access.cycle ? "#8dc9ef" : access.kind === "airlock" ? "#e5c878" : "#83e2bb";
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.fillStyle = "#0b1418";
      ctx.fillRect(-halfWidth - 2, -depth - 2, halfWidth * 2 + 4, depth * 2 + 4);
      ctx.strokeStyle = color;
      ctx.lineWidth = selected ? 2.4 : 1.8;
      if (access.kind === "airlock") {
        ctx.strokeRect(-halfWidth, -depth, halfWidth * 2, depth * 2);
        const enteringFromOutside = !access.cycle || access.cycle.from.x === cells.outside.x && access.cycle.from.y === cells.outside.y;
        const outsideOpen = enteringFromOutside ? doorState.entryOpen : doorState.exitOpen;
        const insideOpen = enteringFromOutside ? doorState.exitOpen : doorState.entryOpen;
        ctx.fillStyle = "#0b1418";
        ctx.fillRect(-halfWidth + 1, -depth - 2, halfWidth * 2 - 2, 4);
        ctx.fillRect(-halfWidth + 1, depth - 2, halfWidth * 2 - 2, 4);
        for (const [leafY, open] of [[-depth, outsideOpen], [depth, insideOpen]] as Array<[number, boolean]>) {
          ctx.beginPath();
          if (open) {
            ctx.moveTo(-halfWidth, leafY);
            ctx.lineTo(-halfWidth * 0.7, leafY);
            ctx.moveTo(halfWidth * 0.7, leafY);
            ctx.lineTo(halfWidth, leafY);
          } else {
            ctx.moveTo(-halfWidth, leafY);
            ctx.lineTo(halfWidth, leafY);
          }
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(-halfWidth, 0);
        ctx.lineTo(doorState.entryOpen ? -halfWidth : halfWidth, doorState.entryOpen ? depth * 1.5 : 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(halfWidth, -depth * 0.7);
        ctx.lineTo(halfWidth, depth * 0.7);
        ctx.stroke();
      }
      if (!access.enabled || failure) {
        ctx.beginPath();
        ctx.moveTo(-3, -3);
        ctx.lineTo(3, 3);
        ctx.moveTo(3, -3);
        ctx.lineTo(-3, 3);
        ctx.stroke();
      }
      ctx.restore();
      if (selected) {
        const inward = { x: cells.inside.x - cells.outside.x, y: cells.inside.y - cells.outside.y };
        const x = centerX + inward.x * metrics.cell * 0.48;
        const y = centerY + inward.y * metrics.cell * 0.48;
        ctx.save();
        ctx.fillStyle = "#0b161b";
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(6, metrics.cell * 0.19), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = `700 ${Math.max(8, Math.min(10, metrics.cell * 0.3))}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(index + 1), x, y);
        ctx.restore();
      }
    });
  }

  function drawSurfaceStaff(ctx: CanvasRenderingContext2D, runtime: RuntimeState, metrics: { cell: number; originX: number; originY: number }): void {
    const state = runtime.state;
    const gateOccupants = new Map<string, Point>();
    const waitingStaff = new Map<string, { point: Point; index: number }>();
    for (const room of state.surfaceRooms) {
      for (const access of getSurfaceAccesses(state, room)) {
        const { inside, outside } = getSurfaceAccessCells(room, access);
        if (access.cycle) gateOccupants.set(access.cycle.staffId, { x: (inside.x + outside.x) / 2 + 0.5, y: (inside.y + outside.y) / 2 + 0.5 });
        access.queue.forEach((request, index) => waitingStaff.set(request.staffId, { point: request.from, index }));
      }
    }
    state.staff.filter((member) => member.status !== "dead" && member.position.layer === "surface").forEach((member, index) => {
      const chamber = gateOccupants.get(member.id);
      const waiting = waitingStaff.get(member.id);
      const staffX = chamber?.x ?? (waiting ? waiting.point.x + 0.15 + (waiting.index % 4) * 0.23 : member.position.x + 0.5 + ((index % 3) - 1) * 0.08);
      const staffY = chamber?.y ?? (waiting ? waiting.point.y + 0.15 + Math.floor(waiting.index / 4) * 0.23 : member.position.y + 0.5 + ((index % 2) - 0.5) * 0.12);
      const x = metrics.originX + staffX * metrics.cell;
      const y = metrics.originY + staffY * metrics.cell;
      const radius = chamber || waiting ? clamp(metrics.cell * 0.075, 1.5, 3) : clamp(metrics.cell * 0.14, 3, 6);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = roleColor(member.role);
      ctx.fill();
      ctx.strokeStyle = member.compromised ? "#ff274f" : "rgba(255,255,255,.6)";
      ctx.stroke();
      if (state.selectedType === "staff" && state.selectedId === member.id) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#79d9b8";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (member.needs.stress > 80 || member.needs.fatigue > 85) {
        ctx.fillStyle = "#f1c56c";
        ctx.font = "9px system-ui";
        ctx.fillText("!", x + radius + 1, y - radius);
      }
    });
  }

  function undergroundMetrics(runtime: RuntimeState, width: number, height: number): { cellW: number; levelH: number; originX: number; originY: number } {
    const camera = runtime.state.camera.underground;
    const cellW = Math.max(24, Math.min(48, width / (runtime.state.undergroundWidth + 2))) * camera.zoom;
    const levelH = Math.max(48, Math.min(74, (height - 100) / runtime.state.undergroundLevels)) * camera.zoom;
    return {
      cellW,
      levelH,
      originX: (width - runtime.state.undergroundWidth * cellW) / 2 + camera.offsetX,
      originY: 72 + camera.offsetY
    };
  }

  export function screenToUndergroundCell(runtime: RuntimeState, clientX: number, clientY: number): Point {
    const rect = runtime.canvas.getBoundingClientRect();
    const metrics = undergroundMetrics(runtime, rect.width, rect.height);
    return {
      x: Math.floor((clientX - rect.left - metrics.originX) / metrics.cellW),
      y: Math.floor((clientY - rect.top - metrics.originY) / metrics.levelH)
    };
  }

  function drawUnderground(runtime: RuntimeState, width: number, height: number): void {
    const state = runtime.state;
    const ctx = runtime.context;
    const metrics = undergroundMetrics(runtime, width, height);
    const totalW = state.undergroundWidth * metrics.cellW;

    for (let level = 0; level < state.undergroundLevels; level += 1) {
      const y = metrics.originY + level * metrics.levelH;
      const rock = level % 2 === 0 ? "#25221f" : "#211f1d";
      ctx.fillStyle = rock;
      ctx.fillRect(metrics.originX - 14, y, totalW + 28, metrics.levelH - 2);
      ctx.strokeStyle = "rgba(255,255,255,.06)";
      ctx.beginPath(); ctx.moveTo(metrics.originX - 14, y); ctx.lineTo(metrics.originX + totalW + 14, y); ctx.stroke();
      ctx.fillStyle = "rgba(217,226,226,.45)";
      ctx.font = "10px system-ui";
      ctx.fillText(`NIVEAU -${level + 1}`, Math.max(10, metrics.originX - 70), y + metrics.levelH / 2 + 3);
      for (let x = 0; x < state.undergroundWidth; x += 1) {
        if ((x + level * 3) % 7 === 0) {
          ctx.fillStyle = "rgba(120,110,96,.08)";
          ctx.beginPath();
          ctx.arc(metrics.originX + x * metrics.cellW + 8, y + 14 + (x % 3) * 8, 3 + (x % 4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    drawUndergroundSurfaceStrip(ctx, runtime, metrics);
    state.undergroundRooms.forEach((room) => drawUndergroundRoom(ctx, runtime, room, metrics));
    // Draw only physical junctions, never imaginary shortcuts through rock.
    const accessible = state.undergroundRooms.filter((room) => canStaffEnterUndergroundRoom(room));
    for (let i = 0; i < accessible.length; i += 1) {
      for (let j = i + 1; j < accessible.length; j += 1) {
        const a = accessible[i], b = accessible[j];
        if (!areUndergroundRoomsConnected(a, b)) continue;
        if (a.level === b.level) {
          const boundary = a.x + a.width === b.x ? b.x : a.x;
          ctx.fillStyle = "rgba(129,226,193,.85)";
          ctx.fillRect(metrics.originX + boundary * metrics.cellW - 2,
            metrics.originY + a.level * metrics.levelH + metrics.levelH * 0.48 - 5, 4, 10);
        } else {
          const x = metrics.originX + (a.x + a.width / 2) * metrics.cellW;
          const top = metrics.originY + Math.min(a.level, b.level) * metrics.levelH;
          ctx.strokeStyle = "rgba(129,226,193,.85)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, top + metrics.levelH - 12);
          ctx.lineTo(x, top + metrics.levelH + 7);
          ctx.stroke();
        }
      }
    }
    drawUndergroundStaff(ctx, runtime, metrics);

    if (runtime.hoveredCell) {
      const hover = runtime.hoveredCell;
      const build = state.buildSelection?.layer === "underground" ? getUndergroundDefinition(state.buildSelection.type as UndergroundRoomType) : undefined;
      const roomWidth = build?.width ?? 1;
      const valid = hover.x >= 0 && hover.y >= 0 && hover.x + roomWidth <= state.undergroundWidth && hover.y < state.undergroundLevels;
      ctx.fillStyle = valid ? "rgba(106,210,175,.18)" : "rgba(230,92,92,.18)";
      ctx.strokeStyle = valid ? "#73d4b2" : "#e05c5c";
      ctx.lineWidth = 2;
      ctx.fillRect(metrics.originX + hover.x * metrics.cellW, metrics.originY + hover.y * metrics.levelH + 4, roomWidth * metrics.cellW, metrics.levelH - 10);
      ctx.strokeRect(metrics.originX + hover.x * metrics.cellW, metrics.originY + hover.y * metrics.levelH + 4, roomWidth * metrics.cellW, metrics.levelH - 10);
    }

    drawCanvasTitle(ctx, "SOUS LE MÊME SITE", "Coupe A-A sous les bâtiments de surface · puits à l'aplomb des ascenseurs", width);
    const contained = state.scps.filter((scp) => scp.contained).length;
    const maxRisk = Math.max(0, ...state.scps.filter((scp) => scp.contained).map((scp) => scp.breachRisk));
    drawLegend(ctx, width, height, [
      ["Niveaux", new Set(state.undergroundRooms.map((room) => room.level)).size, "#9ab7cf"],
      ["SCP confinés", contained, "#73c9a3"],
      ["Risque max", Math.round(maxRisk), maxRisk > 70 ? "#e36e68" : "#d5bd6a"]
    ]);
  }

  function drawUndergroundSurfaceStrip(ctx: CanvasRenderingContext2D, runtime: RuntimeState,
    metrics: { cellW: number; levelH: number; originX: number; originY: number }): void {
    const state = runtime.state;
    const sectionY = getSiteSectionSurfaceY(state);
    const roofTop = metrics.originY - 14;
    ctx.save();
    for (const room of state.surfaceRooms) {
      if (!isSurfaceRoomOnUndergroundSection(state, room)) continue;
      const left = surfaceXToUndergroundX(state, room.x);
      const right = surfaceXToUndergroundX(state, room.x + room.width);
      const visibleLeft = Math.max(0, left);
      const visibleRight = Math.min(state.undergroundWidth, right);
      if (visibleRight <= visibleLeft) continue;
      const x = metrics.originX + visibleLeft * metrics.cellW;
      const w = (visibleRight - visibleLeft) * metrics.cellW;
      const active = state.selectedType === "underground-room" && state.undergroundRooms.some((u) =>
        u.id === state.selectedId && getSurfaceRoomAboveUnderground(state, u)?.id === room.id);
      ctx.fillStyle = active ? "#ffe4a5" : SURFACE_COLORS[room.type];
      ctx.fillRect(x + 1, roofTop, Math.max(1, w - 2), 10);
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.strokeRect(x + 1, roofTop, Math.max(1, w - 2), 10);
    }
    for (const portal of getUndergroundPortals(state)) {
      const x = metrics.originX + (portal.shaft.x + portal.shaft.width / 2) * metrics.cellW;
      ctx.strokeStyle = "#b3f1dd";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(x, roofTop); ctx.lineTo(x, metrics.originY + 8); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(237,236,216,.82)";
    ctx.font = "9px system-ui";
    ctx.textAlign = "left";
    if (metrics.originX > 80) ctx.fillText("BÂTIMENT", metrics.originX - 67, roofTop + 8);
    ctx.restore();
    // Le sous-sol n'ayant pas de Y, cette bande expose honnêtement la coupe
    // A-A de la surface au lieu de fabriquer des bâtiments imaginaires.
    void sectionY;
  }

  function drawUndergroundRoom(ctx: CanvasRenderingContext2D, runtime: RuntimeState, room: UndergroundRoom, metrics: { cellW: number; levelH: number; originX: number; originY: number }): void {
    const state = runtime.state;
    const definition = getUndergroundDefinition(room.type);
    const selected = state.selectedType === "underground-room" && state.selectedId === room.id;
    const x = metrics.originX + room.x * metrics.cellW;
    const y = metrics.originY + room.level * metrics.levelH + 5;
    const w = room.width * metrics.cellW;
    const h = metrics.levelH - 11;

    ctx.save();
    ctx.shadowColor = selected ? "rgba(116,221,186,.8)" : "rgba(0,0,0,.5)";
    ctx.shadowBlur = selected ? 12 : 5;
    ctx.fillStyle = UNDERGROUND_COLORS[room.type];
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.restore();
    ctx.strokeStyle = selected ? "#79d9b8" : room.sealed ? "#e3b960" : room.condition < 45 ? "#dc6d65" : "rgba(235,241,241,.25)";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    if (room.type === "elevator-shaft") {
      ctx.strokeStyle = "rgba(225,235,237,.45)";
      ctx.beginPath(); ctx.moveTo(x + w * 0.35, y + 6); ctx.lineTo(x + w * 0.35, y + h - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w * 0.65, y + 6); ctx.lineTo(x + w * 0.65, y + h - 6); ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#f1f4f4";
    ctx.font = `700 ${Math.max(9, Math.min(13, metrics.cellW * 0.3))}px system-ui`;
    ctx.fillText(definition.icon, x + w / 2, y + h / 2 - 3);
    if (w > 75) {
      ctx.font = "9px system-ui";
      ctx.fillStyle = "rgba(239,244,244,.8)";
      ctx.fillText(definition.name.length > 24 ? `${definition.name.slice(0, 22)}…` : definition.name, x + w / 2, y + h / 2 + 12);
    }
    ctx.textAlign = "left";

    if (room.scpId) {
      const scp = state.scps.find((entry) => entry.id === room.scpId);
      if (scp) {
        const scpDefinition = getSCPDefinition(scp.definitionId);
        drawPill(ctx, x + w - 27, y + 12, scpDefinition.designation.replace("SCP-", ""), objectClassColor(scpDefinition.objectClass));
        const riskWidth = Math.max(12, w - 14);
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.fillRect(x + 7, y + h - 8, riskWidth, 3);
        ctx.fillStyle = scp.breachRisk > 75 ? "#e85e65" : scp.breachRisk > 45 ? "#d7b45d" : "#65c98e";
        ctx.fillRect(x + 7, y + h - 8, riskWidth * clamp(scp.breachRisk / 100, 0, 1), 3);
      }
    }
    if (room.condition < 55) drawWarningBadge(ctx, x + 8, y + 9, "!");
  }

  function drawUndergroundStaff(ctx: CanvasRenderingContext2D, runtime: RuntimeState, metrics: { cellW: number; levelH: number; originX: number; originY: number }): void {
    runtime.state.staff.filter((member) => member.status !== "dead" && member.position.layer === "underground").forEach((member, index) => {
      const level = member.position.level ?? Math.round(member.position.y);
      const x = metrics.originX + (member.position.x + (index % 3) * 0.12) * metrics.cellW;
      const y = metrics.originY + level * metrics.levelH + metrics.levelH * 0.72;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = roleColor(member.role);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.stroke();
    });
  }

  interface CommandCard {
    zone: CrisisZone;
    titleLines: string[];
    x: number;
    y: number;
    width: number;
    height: number;
  }

  function wrapCanvasLabel(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    let line = "";
    for (const word of text.trim().split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth) {
        line = next;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      // Also retain a long unbroken name without drawing into the next card.
      for (const character of word) {
        if (line && ctx.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = character;
        } else line += character;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  function commandCards(runtime: RuntimeState, width: number, height: number): CommandCard[] {
    const zones = runtime.state.crisis.zones;
    const columns = width < 760 ? 2 : 3;
    const gap = 14;
    const cardWidth = Math.min(260, (width - 40 - gap * (columns - 1)) / columns);
    runtime.context.save();
    runtime.context.font = "700 12px system-ui";
    const titles = zones.map((zone) => wrapCanvasLabel(runtime.context, zone.name, cardWidth - 24));
    runtime.context.restore();
    const cardHeight = 128 + (Math.max(1, ...titles.map((lines) => lines.length)) - 1) * 14;
    return zones.map((zone, index) => ({
      zone,
      titleLines: titles[index],
      x: 20 + (index % columns) * (cardWidth + gap),
      y: 82 + Math.floor(index / columns) * (cardHeight + gap),
      width: cardWidth,
      height: cardHeight
    })).filter((card) => card.y < height - 30);
  }

  export function screenToCommandZone(runtime: RuntimeState, clientX: number, clientY: number): CrisisZone | undefined {
    const rect = runtime.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return commandCards(runtime, rect.width, rect.height).find((card) => pointInRect({ x, y }, card.x, card.y, card.width, card.height))?.zone;
  }

  function drawCommand(runtime: RuntimeState, width: number, height: number): void {
    const state = runtime.state;
    const ctx = runtime.context;
    const crisis = state.crisis;
    drawCanvasTitle(ctx, crisis.active ? crisis.title.toUpperCase() : "CENTRE DE COMMANDEMENT", crisis.active ? crisis.description : "Aucune alerte critique en cours — les exercices restent disponibles", width);

    if (!crisis.active && !crisis.resolved) {
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(225,234,235,.75)";
      ctx.font = "600 18px system-ui";
      ctx.fillText("ÉTAT NOMINAL", width / 2, height / 2 - 10);
      ctx.font = "13px system-ui";
      ctx.fillStyle = "rgba(225,234,235,.55)";
      ctx.fillText("Le centre de commandement surveille les flux, alarmes et communications.", width / 2, height / 2 + 18);
      ctx.textAlign = "left";
      return;
    }

    if (!crisis.active && crisis.resolved) {
      drawCrisisSummary(ctx, crisis, width, height);
      return;
    }

    const cards = commandCards(runtime, width, height);
    cards.forEach((card) => {
      const selected = state.selectedType === "zone" && state.selectedId === card.zone.id;
      ctx.fillStyle = selected ? "rgba(71,102,100,.72)" : "rgba(31,39,44,.92)";
      ctx.fillRect(card.x, card.y, card.width, card.height);
      ctx.strokeStyle = selected ? "#78d7b7" : card.zone.threat > 65 ? "#db6868" : "rgba(235,241,241,.16)";
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(card.x, card.y, card.width, card.height);
      ctx.fillStyle = "#eef3f3";
      ctx.font = "700 12px system-ui";
      card.titleLines.forEach((line, index) => ctx.fillText(line, card.x + 12, card.y + 20 + index * 14));
      const titleOffset = card.height - 128;
      ctx.font = "10px system-ui";
      ctx.fillStyle = "rgba(231,237,238,.65)";
      ctx.fillText(`Population ${card.zone.population} · Victimes ${card.zone.casualties}`, card.x + 12, card.y + 38 + titleOffset);
      drawMiniBar(ctx, card.x + 12, card.y + 49 + titleOffset, card.width - 24, 8, card.zone.threat, "Menace", card.zone.threat > 65 ? "#df6669" : "#d3ad5a");
      drawMiniBar(ctx, card.x + 12, card.y + 72 + titleOffset, card.width - 24, 6, card.zone.security, "Sécurité", "#68a9d3");
      drawMiniBar(ctx, card.x + 12, card.y + 93 + titleOffset, card.width - 24, 6, card.zone.contamination, "Contam.", "#72bd75");
      if (card.zone.sealed) drawPill(ctx, card.x + card.width - 34, card.y + card.height - 10, "SCELLÉ", "#9c7d42");
      if (card.zone.evacuated) drawPill(ctx, card.x + card.width - (card.zone.sealed ? 84 : 34), card.y + card.height - 10, "ÉVAC.", "#55768d");
    });

    drawLegend(ctx, width, height, [
      ["Intégrité", Math.round(crisis.siteIntegrity), crisis.siteIntegrity < 40 ? "#e36e68" : "#73c9a3"],
      ["Voile", Math.round(crisis.veilExposure), crisis.veilExposure > 60 ? "#e36e68" : "#d5bd6a"],
      ["Menace", Math.round(crisis.threatProgress), crisis.threatProgress > 65 ? "#e36e68" : "#d5bd6a"]
    ]);
  }

  function drawCrisisSummary(ctx: CanvasRenderingContext2D, crisis: CrisisState, width: number, height: number): void {
    ctx.textAlign = "center";
    ctx.fillStyle = crisis.resolved === "success" ? "#72d09a" : "#e26b6b";
    ctx.font = "700 24px system-ui";
    ctx.fillText(crisis.resolved === "success" ? "SITE STABILISÉ" : "ÉCHEC DE CONFINEMENT", width / 2, height / 2 - 55);
    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(231,238,239,.72)";
    const casualties = crisis.zones.reduce((sum, zone) => sum + zone.casualties, 0);
    ctx.fillText(`Intégrité ${Math.round(crisis.siteIntegrity)} % · Exposition ${Math.round(crisis.veilExposure)} % · ${casualties} victime(s)`, width / 2, height / 2 - 20);
    ctx.fillText("Le rapport après action et les addenda de procédure sont disponibles dans Gestion.", width / 2, height / 2 + 10);
    ctx.textAlign = "left";
  }

  function drawManagementBackdrop(runtime: RuntimeState, width: number, height: number): void {
    const ctx = runtime.context;
    ctx.fillStyle = "rgba(26,33,38,.86)";
    ctx.fillRect(22, 74, width - 44, height - 104);
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.strokeRect(22, 74, width - 44, height - 104);
    ctx.fillStyle = "rgba(108,191,162,.12)";
    for (let index = 0; index < 6; index += 1) {
      ctx.fillRect(42 + index * ((width - 100) / 6), 100, 2, height - 160);
    }
    drawCanvasTitle(ctx, "GESTION DU SITE", "Personnel, procédures, recherche, dossiers SCP, rapports et progression", width);
  }

  export function selectAtCanvas(runtime: RuntimeState, clientX: number, clientY: number): void {
    const state = runtime.state;
    if (state.view === "region") {
      const rect = runtime.canvas.getBoundingClientRect();
      const metrics = regionMetrics(runtime, rect.width);
      const dx = (clientX - rect.left - metrics.originX) / (metrics.tileW * 0.5);
      const dy = (clientY - rect.top - metrics.originY) / (metrics.tileH * 0.5);
      const linked = getSurfaceRoomAtRegionPosition(state, { x: (dx + dy) / 2, y: (dy - dx) / 2 });
      if (linked) {
        state.selectedId = linked.id;
        state.selectedType = "surface-room";
      } else {
        selectAtGridCell(runtime, screenToRegionCell(runtime, clientX, clientY));
      }
    } else if (state.view === "surface") {
      selectAtGridCell(runtime, screenToSurfaceCell(runtime, clientX, clientY));
    } else if (state.view === "underground") {
      selectAtGridCell(runtime, screenToUndergroundCell(runtime, clientX, clientY));
    } else if (state.view === "command") {
      const zone = screenToCommandZone(runtime, clientX, clientY);
      state.selectedId = zone?.id;
      state.selectedType = zone ? "zone" : undefined;
    }
  }

  export function selectAtGridCell(runtime: RuntimeState, cell: Point): void {
    const state = runtime.state;
    if (state.view === "region") {
      const linked = getSurfaceRoomAtRegionPosition(state, { x: cell.x + 0.5, y: cell.y + 0.5 });
      const facility = !linked ? [...state.regionFacilities].reverse().find((entry) => pointInRect(cell, entry.x, entry.y, entry.width, entry.height)) : undefined;
      state.selectedId = linked?.id ?? facility?.id;
      state.selectedType = linked ? "surface-room" : facility ? "facility" : undefined;
    } else if (state.view === "surface") {
      const room = [...state.surfaceRooms].reverse().find((entry) => pointInRect(cell, entry.x, entry.y, entry.width, entry.height));
      if (room) {
        state.selectedId = room.id;
        state.selectedType = "surface-room";
      } else {
        const staff = state.staff.find((member) => member.position.layer === "surface" && Math.hypot(member.position.x - cell.x, member.position.y - cell.y) < 0.8);
        state.selectedId = staff?.id;
        state.selectedType = staff ? "staff" : undefined;
      }
    } else if (state.view === "underground") {
      const room = [...state.undergroundRooms].reverse().find((entry) => entry.level === cell.y && cell.x >= entry.x && cell.x < entry.x + entry.width);
      state.selectedId = room?.id;
      state.selectedType = room ? "underground-room" : undefined;
    }
  }

  function drawCanvasTitle(ctx: CanvasRenderingContext2D, title: string, subtitle: string, width: number): void {
    ctx.fillStyle = "rgba(9,13,16,.72)";
    ctx.fillRect(0, 0, width, 54);
    ctx.fillStyle = "#ecf2f2";
    ctx.font = "700 15px system-ui";
    ctx.fillText(title, 18, 22);
    ctx.fillStyle = "rgba(226,235,236,.58)";
    ctx.font = "11px system-ui";
    ctx.fillText(subtitle.length > 100 ? `${subtitle.slice(0, 98)}…` : subtitle, 18, 40);
  }

  function drawLegend(ctx: CanvasRenderingContext2D, width: number, height: number, entries: Array<[string, number, string]>): void {
    const itemWidth = 110;
    const total = entries.length * itemWidth;
    const startX = Math.max(8, width - total - 10);
    const y = height - 34;
    ctx.fillStyle = "rgba(8,12,14,.78)";
    ctx.fillRect(startX - 8, y - 9, total + 8, 30);
    entries.forEach(([label, value, color], index) => {
      const x = startX + index * itemWidth;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x + 5, y + 5, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(232,239,239,.58)";
      ctx.font = "9px system-ui";
      ctx.fillText(label, x + 14, y + 2);
      ctx.fillStyle = "#f0f4f4";
      ctx.font = "700 11px system-ui";
      ctx.fillText(String(value), x + 14, y + 15);
    });
  }

  function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string): void {
    const width = Math.max(20, text.length * 5 + 10);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - 8, width, 16, 8);
    ctx.fill();
    ctx.fillStyle = "#101416";
    ctx.font = "700 8px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y + 3);
    ctx.textAlign = "left";
  }

  function drawWarningBadge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#df6a62";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y + 3);
    ctx.textAlign = "left";
  }

  function drawMiniBar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, value: number, label: string, color: string): void {
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width * clamp(value / 100, 0, 1), height);
    ctx.fillStyle = "rgba(236,242,242,.62)";
    ctx.font = "8px system-ui";
    ctx.fillText(`${label} ${Math.round(value)}%`, x, y - 2);
  }
}

