namespace SCPGame {
  export class SeededRandom {
    private value: number;

    constructor(seed: number) {
      this.value = seed >>> 0;
    }

    next(): number {
      this.value += 0x6d2b79f5;
      let t = this.value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    }

    pick<T>(items: T[]): T {
      return items[this.int(0, items.length - 1)];
    }

    chance(probability: number): boolean {
      return this.next() < probability;
    }
  }

  let idCounter = 0;

  export function uid(prefix = "id"): string {
    idCounter += 1;
    return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
  }

  export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  export function round(value: number, digits = 0): number {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  export function formatNumber(value: number): string {
    if (Math.abs(value) >= 1_000_000) return `${round(value / 1_000_000, 1)} M`;
    if (Math.abs(value) >= 1_000) return `${round(value / 1_000, 1)} k`;
    return Math.round(value).toLocaleString("fr-FR");
  }

  export function formatTime(day: number, minuteOfDay: number): string {
    const hour = Math.floor(minuteOfDay / 60);
    const minute = Math.floor(minuteOfDay % 60);
    return `J${day} · ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  export function getDifficultyMultiplier(difficulty: Difficulty): number {
    switch (difficulty) {
      case "story": return 0.72;
      case "standard": return 1;
      case "director": return 1.28;
      case "keter": return 1.6;
    }
  }

  export function canAfford(resources: ResourceState, cost: Cost): boolean {
    return Object.entries(cost).every(([key, amount]) => {
      if (!amount) return true;
      const resourceKey = key as ResourceKey;
      const available = getResource(resources, resourceKey);
      return available >= amount;
    });
  }

  export function payCost(resources: ResourceState, cost: Cost): boolean {
    if (!canAfford(resources, cost)) return false;
    Object.entries(cost).forEach(([key, amount]) => {
      if (!amount) return;
      addResource(resources, key as ResourceKey, -amount);
    });
    return true;
  }

  export function addCost(resources: ResourceState, cost: Cost): void {
    Object.entries(cost).forEach(([key, amount]) => {
      if (!amount) return;
      addResource(resources, key as ResourceKey, amount);
    });
  }

  export function getResource(resources: ResourceState, key: ResourceKey): number {
    switch (key) {
      case "funds": return resources.funds;
      case "power": return resources.power;
      case "water": return resources.water;
      case "food": return resources.food;
      case "medical": return resources.medical;
      case "parts": return resources.parts;
      case "chemicals": return resources.chemicals;
      case "ammo": return resources.ammo;
      case "intel": return resources.intel;
      case "research": return resources.research;
    }
  }

  export function addResource(resources: ResourceState, key: ResourceKey, amount: number): void {
    switch (key) {
      case "funds": resources.funds = Math.max(0, resources.funds + amount); break;
      case "power": resources.power = clamp(resources.power + amount, 0, resources.powerCapacity); break;
      case "water": resources.water = clamp(resources.water + amount, 0, resources.waterCapacity); break;
      case "food": resources.food = Math.max(0, resources.food + amount); break;
      case "medical": resources.medical = Math.max(0, resources.medical + amount); break;
      case "parts": resources.parts = Math.max(0, resources.parts + amount); break;
      case "chemicals": resources.chemicals = Math.max(0, resources.chemicals + amount); break;
      case "ammo": resources.ammo = Math.max(0, resources.ammo + amount); break;
      case "intel": resources.intel = Math.max(0, resources.intel + amount); break;
      case "research": resources.research = Math.max(0, resources.research + amount); break;
    }
  }

  export function costToString(cost: Cost): string {
    return Object.entries(cost)
      .filter(([, amount]) => Boolean(amount))
      .map(([key, amount]) => `${RESOURCE_LABELS[key as ResourceKey]} ${formatNumber(amount as number)}`)
      .join(" · ");
  }

  export function pointInRect(point: Point, x: number, y: number, width: number, height: number): boolean {
    return point.x >= x && point.x < x + width && point.y >= y && point.y < y + height;
  }

  export function rectanglesOverlap(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  export function undergroundOverlap(a: { x: number; level: number; width: number }, b: { x: number; level: number; width: number }): boolean {
    return a.level === b.level && a.x < b.x + b.width && a.x + a.width > b.x;
  }

  export function deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  export function choiceWeighted<T extends { weight: number }>(rng: SeededRandom, entries: T[]): T | undefined {
    if (entries.length === 0) return undefined;
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = rng.next() * total;
    for (const entry of entries) {
      roll -= entry.weight;
      if (roll <= 0) return entry;
    }
    return entries[entries.length - 1];
  }

  export function getManhattanPath(start: Point, target: Point, width: number, height: number, blocked?: Set<string>): Point[] {
    const queue: Point[] = [start];
    const cameFrom = new Map<string, string>();
    const startKey = `${start.x},${start.y}`;
    const targetKey = `${target.x},${target.y}`;
    cameFrom.set(startKey, "");
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    while (queue.length > 0) {
      const current = queue.shift() as Point;
      const currentKey = `${current.x},${current.y}`;
      if (currentKey === targetKey) break;
      for (const direction of directions) {
        const next = { x: current.x + direction.x, y: current.y + direction.y };
        const key = `${next.x},${next.y}`;
        if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) continue;
        if (blocked?.has(key) && key !== targetKey) continue;
        if (cameFrom.has(key)) continue;
        cameFrom.set(key, currentKey);
        queue.push(next);
      }
    }

    if (!cameFrom.has(targetKey)) return [];
    const result: Point[] = [];
    let currentKey = targetKey;
    while (currentKey && currentKey !== startKey) {
      const [x, y] = currentKey.split(",").map(Number);
      result.push({ x, y });
      currentKey = cameFrom.get(currentKey) ?? "";
    }
    result.reverse();
    return result;
  }

  export function sanitizeText(value: string): string {
    return value.replace(/[<>]/g, "").slice(0, 600);
  }

  export function downloadText(filename: string, content: string, type = "application/json"): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  export function roleColor(role: StaffRole): string {
    switch (role) {
      case "director": return "#f2d27a";
      case "researcher": return "#70b7ff";
      case "guard": return "#ff8a7a";
      case "engineer": return "#ffb65c";
      case "medic": return "#7ce2b0";
      case "logistics": return "#c6a0ff";
      case "admin": return "#d4d7dc";
      case "mtf": return "#f35d7c";
    }
  }

  export function objectClassColor(objectClass: ObjectClass): string {
    switch (objectClass) {
      case "Safe": return "#6fd18b";
      case "Euclid": return "#f1ca64";
      case "Keter": return "#f06666";
      case "Thaumiel": return "#6fa8ff";
      case "Neutralized": return "#a0a4aa";
    }
  }

  export function severityColor(severity: EventSeverity): string {
    switch (severity) {
      case "info": return "#6fa8ff";
      case "minor": return "#d7c56f";
      case "major": return "#f1a45b";
      case "critical": return "#f06666";
    }
  }
}
