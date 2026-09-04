namespace SCPGame {
  class ProceduralAudio {
    private context?: AudioContext;
    private lastCrisis = false;
    private lastClickAt = 0;

    ensure(): void {
      if (!this.context) this.context = new AudioContext();
      if (this.context.state === "suspended") void this.context.resume();
    }

    click(enabled: boolean): void {
      if (!enabled || Date.now() - this.lastClickAt < 45) return;
      this.lastClickAt = Date.now();
      this.tone(420, 0.025, 0.025);
    }

    notify(enabled: boolean, critical = false): void {
      if (!enabled) return;
      this.tone(critical ? 175 : 620, critical ? 0.22 : 0.07, critical ? 0.08 : 0.035);
      if (critical) window.setTimeout(() => this.tone(140, 0.28, 0.07), 180);
    }

    update(state: GameState): void {
      if (state.crisis.active && !this.lastCrisis) this.notify(state.settings.audio, true);
      this.lastCrisis = state.crisis.active;
    }

    private tone(frequency: number, duration: number, gainValue: number): void {
      try {
        this.ensure();
        if (!this.context) return;
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = "square";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(gainValue, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.start();
        oscillator.stop(this.context.currentTime + duration);
      } catch {
        // Le jeu reste pleinement jouable si le navigateur bloque l'audio.
      }
    }
  }

  function boot(): void {
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
    if (!canvas) throw new Error("Canvas principal introuvable.");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Contexte 2D indisponible.");

    const loaded = loadLatestGame();
    const state = loaded ?? createNewGame("campaign", "standard");
    state.speed = 0;
    const runtime: RuntimeState = {
      state,
      canvas,
      context,
      lastFrame: performance.now(),
      accumulator: 0,
      pointerDown: false,
      uiDirty: true,
      canvasDirty: true,
      animationFrame: 0
    };
    const audio = new ProceduralAudio();

    initializeUI(runtime);
    bindCanvas(runtime, audio);
    bindGlobalAudio(audio, runtime);
    showStartScreen();
    renderCanvas(runtime);
    runtime.canvasDirty = false;

    const frame = (time: number): void => {
      const deltaSeconds = Math.min(0.12, Math.max(0, (time - runtime.lastFrame) / 1000));
      runtime.lastFrame = time;
      if (runtime.state.speed > 0 && !runtime.state.gameOver && !runtime.state.victory) {
        runtime.accumulator += deltaSeconds * getSimulationMinutesPerRealSecond() * runtime.state.speed;
        const minutes = Math.floor(runtime.accumulator);
        if (minutes > 0) {
          runtime.accumulator -= minutes;
          advanceSimulation(runtime.state, minutes);
          runtime.uiDirty = true;
          runtime.canvasDirty = true;
        }
      }
      audio.update(runtime.state);
      if (!document.hidden && runtime.canvasDirty) {
        renderCanvas(runtime);
        runtime.canvasDirty = false;
      }
      if (runtime.uiDirty) refreshUI(runtime);
      runtime.animationFrame = requestAnimationFrame(frame);
    };
    runtime.animationFrame = requestAnimationFrame(frame);

    window.addEventListener("resize", () => {
      runtime.canvasDirty = true;
      runtime.uiDirty = true;
    });
    document.addEventListener("visibilitychange", () => {
      runtime.lastFrame = performance.now();
      if (!document.hidden) {
        runtime.canvasDirty = true;
        runtime.uiDirty = true;
      }
    });
    window.addEventListener("beforeunload", () => saveGame(runtime.state, true));

    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./service-worker.js").catch(() => undefined);
    }
  }

  function bindGlobalAudio(audio: ProceduralAudio, runtime: RuntimeState): void {
    document.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest("button")) audio.click(runtime.state.settings.audio);
    }, { passive: true });
  }

  function bindCanvas(runtime: RuntimeState, audio: ProceduralAudio): void {
    const canvas = runtime.canvas;
    let moved = false;
    let lastPointer: Point | undefined;

    canvas.addEventListener("pointermove", (event) => {
      runtime.hoveredCell = hoverCellForView(runtime, event.clientX, event.clientY);
      runtime.canvasDirty = true;
      if (runtime.pointerDown && lastPointer) {
        const dx = event.clientX - lastPointer.x;
        const dy = event.clientY - lastPointer.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        const camera = runtime.state.camera[runtime.state.view];
        if (["region", "surface", "underground"].includes(runtime.state.view)) {
          camera.offsetX += dx;
          camera.offsetY += dy;
          runtime.canvasDirty = true;
        }
      }
      lastPointer = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener("pointerdown", (event) => {
      runtime.pointerDown = true;
      moved = false;
      lastPointer = { x: event.clientX, y: event.clientY };
      runtime.dragStart = lastPointer;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointerup", (event) => {
      runtime.pointerDown = false;
      canvas.releasePointerCapture(event.pointerId);
      if (!moved) {
        audio.click(runtime.state.settings.audio);
        handleCanvasActivation(runtime, event.clientX, event.clientY);
      }
      lastPointer = undefined;
      runtime.dragStart = undefined;
      runtime.uiDirty = true;
      runtime.canvasDirty = true;
      refreshUI(runtime, true);
    });

    canvas.addEventListener("pointerleave", () => {
      if (!runtime.pointerDown) {
        runtime.hoveredCell = undefined;
        runtime.canvasDirty = true;
      }
    });

    canvas.addEventListener("wheel", (event) => {
      if (!["region", "surface", "underground"].includes(runtime.state.view)) return;
      event.preventDefault();
      const camera = runtime.state.camera[runtime.state.view];
      const oldZoom = camera.zoom;
      camera.zoom = clamp(camera.zoom * (event.deltaY > 0 ? 0.9 : 1.1), 0.62, 1.5);
      const rect = canvas.getBoundingClientRect();
      const pointerX = event.clientX - rect.left - rect.width / 2;
      const pointerY = event.clientY - rect.top - rect.height / 2;
      const ratio = camera.zoom / oldZoom;
      camera.offsetX -= pointerX * (ratio - 1) * 0.35;
      camera.offsetY -= pointerY * (ratio - 1) * 0.35;
      runtime.canvasDirty = true;
    }, { passive: false });

    canvas.addEventListener("keydown", (event) => {
      if (["+", "=", "-", "PageUp", "PageDown"].includes(event.key)) {
        if (!["region", "surface", "underground"].includes(runtime.state.view)) return;
        event.preventDefault();
        event.stopPropagation();
        const camera = runtime.state.camera[runtime.state.view];
        const zoomIn = ["+", "=", "PageUp"].includes(event.key);
        camera.zoom = clamp(camera.zoom * (zoomIn ? 1.1 : 0.9), 0.62, 1.5);
        runtime.canvasDirty = true;
        announceCanvas(`Zoom ${Math.round(camera.zoom * 100)} %.`);
        return;
      }
      const bounds = gridBounds(runtime.state);
      if (!bounds) return;
      const current = runtime.hoveredCell ?? { x: Math.floor(bounds.width / 2), y: Math.floor(bounds.height / 2) };
      let next = { ...current };
      if (event.key === "ArrowLeft") next.x -= 1;
      else if (event.key === "ArrowRight") next.x += 1;
      else if (event.key === "ArrowUp") next.y -= 1;
      else if (event.key === "ArrowDown") next.y += 1;
      else if (event.key === "Home") next = { x: Math.floor(bounds.width / 2), y: Math.floor(bounds.height / 2) };
      else if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        audio.click(runtime.state.settings.audio);
        handleGridCellActivation(runtime, current);
        announceCanvas(`Case ${current.x + 1}, ${current.y + 1} activée.`);
        runtime.uiDirty = true;
        runtime.canvasDirty = true;
        refreshUI(runtime, true);
        return;
      } else return;
      event.preventDefault();
      event.stopPropagation();
      next.x = clamp(next.x, 0, bounds.width - 1);
      next.y = clamp(next.y, 0, bounds.height - 1);
      runtime.hoveredCell = next;
      runtime.canvasDirty = true;
      announceCanvas(`Curseur colonne ${next.x + 1}, ligne ${next.y + 1}.`);
    });

    canvas.addEventListener("blur", () => {
      runtime.hoveredCell = undefined;
      runtime.canvasDirty = true;
    });
  }

  function hoverCellForView(runtime: RuntimeState, clientX: number, clientY: number): Point | undefined {
    if (runtime.state.view === "region") return screenToRegionCell(runtime, clientX, clientY);
    if (runtime.state.view === "surface") return screenToSurfaceCell(runtime, clientX, clientY);
    if (runtime.state.view === "underground") return screenToUndergroundCell(runtime, clientX, clientY);
    return undefined;
  }

  function handleCanvasActivation(runtime: RuntimeState, clientX: number, clientY: number): void {
    const cell = hoverCellForView(runtime, clientX, clientY);
    if (cell) {
      handleGridCellActivation(runtime, cell);
      return;
    }
    selectAtCanvas(runtime, clientX, clientY);
  }

  function handleGridCellActivation(runtime: RuntimeState, cell: Point): void {
    const state = runtime.state;
    const build = state.buildSelection;
    let result: { ok: boolean; message: string } | undefined;
    if (build && build.layer === "region" && state.view === "region") {
      result = buildRegionFacility(state, build.type as RegionFacilityType, cell.x, cell.y);
    } else if (build && build.layer === "surface" && state.view === "surface") {
      result = buildSurfaceRoom(state, build.type as SurfaceRoomType, cell.x, cell.y);
    } else if (build && build.layer === "underground" && state.view === "underground") {
      result = buildUndergroundRoom(state, build.type as UndergroundRoomType, cell.x, cell.y);
    } else {
      selectAtGridCell(runtime, cell);
    }
    if (result) showToast(result.message, result.ok ? "success" : "error");
  }

  function gridBounds(state: GameState): { width: number; height: number } | undefined {
    if (state.view === "region") return { width: state.regionWidth, height: state.regionHeight };
    if (state.view === "surface") return { width: state.surfaceWidth, height: state.surfaceHeight };
    if (state.view === "underground") return { width: state.undergroundWidth, height: state.undergroundLevels };
    return undefined;
  }

  function announceCanvas(message: string): void {
    const status = document.getElementById("canvas-status");
    if (status) status.textContent = message;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
