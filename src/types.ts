namespace SCPGame {
  export type ViewMode = "region" | "surface" | "underground" | "command" | "management";
  export type Difficulty = "story" | "standard" | "director" | "keter";
  export type GameSpeed = 0 | 1 | 2 | 4;
  export type Layer = "region" | "surface" | "underground";
  export type StaffRole = "director" | "researcher" | "guard" | "engineer" | "medic" | "logistics" | "admin" | "mtf";
  export type StaffStatus = "working" | "moving" | "resting" | "eating" | "queued" | "training" | "injured" | "quarantined" | "off-duty" | "dead";
  export type ObjectClass = "Safe" | "Euclid" | "Keter" | "Thaumiel" | "Neutralized";
  export type ResourceKey = "funds" | "power" | "water" | "food" | "medical" | "parts" | "chemicals" | "ammo" | "intel" | "research";
  export type ReputationKey = "command" | "personnel" | "cover" | "ethics";
  export type RegionFacilityType = "cover-office" | "road" | "parking" | "power-plant" | "water-treatment" | "supply-depot" | "housing" | "helipad" | "rail-terminal" | "public-clinic" | "data-center" | "checkpoint" | "watchtower" | "green-zone";
  export type SurfaceRoomType = "corridor" | "reception" | "checkpoint" | "administration" | "access-office" | "archive" | "medical" | "quarantine" | "decontamination" | "intake" | "laboratory" | "research" | "staff-room" | "canteen" | "restroom" | "maintenance" | "warehouse" | "armory" | "briefing" | "command-center" | "training" | "mtf-bay" | "waste-processing" | "power-distribution" | "elevator";
  export type UndergroundRoomType = "excavated" | "elevator-shaft" | "service-tunnel" | "safe-containment" | "euclid-containment" | "keter-containment" | "humanoid-cell" | "bio-containment" | "infohazard-vault" | "heavy-containment" | "research-lab" | "security-post" | "medical-bay" | "power-node" | "air-filtration" | "emergency-shelter" | "acid-system" | "temporal-lock";
  export type BuildType = RegionFacilityType | SurfaceRoomType | UndergroundRoomType;
  export type EventSeverity = "info" | "minor" | "major" | "critical";
  export type CrisisOrderType = "lockdown" | "evacuate" | "deploy-security" | "deploy-mtf" | "restore-power" | "decontaminate" | "medical-response" | "seal-ventilation" | "amnestic-response";

  export interface Point {
    x: number;
    y: number;
  }

  export interface LayerPoint extends Point {
    layer: Layer;
    level?: number;
    /** Transverse row in the underground plane; y still describes depth there. */
    sectionY?: number;
  }

  export interface Cost {
    funds?: number;
    power?: number;
    water?: number;
    food?: number;
    medical?: number;
    parts?: number;
    chemicals?: number;
    ammo?: number;
    intel?: number;
    research?: number;
  }

  export interface ResourceState {
    funds: number;
    power: number;
    powerCapacity: number;
    water: number;
    waterCapacity: number;
    food: number;
    medical: number;
    parts: number;
    chemicals: number;
    ammo: number;
    intel: number;
    research: number;
  }

  export interface ReputationState {
    command: number;
    personnel: number;
    cover: number;
    ethics: number;
    suspicion: number;
  }

  export interface RegionFacilityDefinition {
    type: RegionFacilityType;
    name: string;
    icon: string;
    description: string;
    cost: Cost;
    upkeep: number;
    powerProduction?: number;
    waterProduction?: number;
    coverImpact?: number;
    suspicionImpact?: number;
    supplyProduction?: Partial<ResourceState>;
    size: Point;
    unlockedAt: number;
  }

  export interface SurfaceRoomDefinition {
    type: SurfaceRoomType;
    name: string;
    icon: string;
    description: string;
    cost: Cost;
    upkeep: number;
    powerUse: number;
    waterUse: number;
    minSize: Point;
    capacity: number;
    requiredRoles: Partial<Record<StaffRole, number>>;
    services: string[];
    security: number;
    containment: number;
    unlockedAt: number;
  }

  export interface UndergroundRoomDefinition {
    type: UndergroundRoomType;
    name: string;
    icon: string;
    description: string;
    cost: Cost;
    upkeep: number;
    powerUse: number;
    waterUse: number;
    width: number;
    containment: number;
    security: number;
    tags: string[];
    unlockedAt: number;
  }

  export interface RegionFacility {
    id: string;
    type: RegionFacilityType;
    x: number;
    y: number;
    width: number;
    height: number;
    level: number;
    condition: number;
    staffed: boolean;
    enabled: boolean;
  }

  export type SurfaceAccessSide = "north" | "east" | "south" | "west";
  export type SurfaceTraffic = "public" | "staff" | "security" | "medical" | "contaminated" | "freight" | "anomaly";

  export interface SurfaceAccessRequest {
    staffId: string;
    from: Point;
    to: Point;
    requestedAt: number;
    expiresAt: number;
  }

  export interface SurfaceAccessCycle extends SurfaceAccessRequest {
    phase: "entering" | "equalizing" | "exiting";
    remaining: number;
  }

  export interface SurfaceAccess {
    id: string;
    side: SurfaceAccessSide;
    offset: number;
    kind: "door" | "airlock";
    enabled: boolean;
    minClearance: 0 | 1 | 2 | 3 | 4 | 5;
    allowedTraffic: SurfaceTraffic[];
    direction: "both" | "in" | "out";
    queueCapacity: number;
    powered: boolean;
    airSupply: boolean;
    queue: SurfaceAccessRequest[];
    cycle?: SurfaceAccessCycle;
    passedCount: number;
    paidFunds: number;
    paidParts: number;
  }

  export interface SurfaceAccessConfig {
    side: SurfaceAccessSide;
    offset: number;
    kind: "door" | "airlock";
    enabled: boolean;
    minClearance: 0 | 1 | 2 | 3 | 4 | 5;
    allowedTraffic: SurfaceTraffic[];
    direction: "both" | "in" | "out";
    queueCapacity: number;
    powered: boolean;
    airSupply: boolean;
  }

  export interface SurfaceRoom {
    id: string;
    type: SurfaceRoomType;
    x: number;
    y: number;
    width: number;
    height: number;
    level: number;
    condition: number;
    cleanliness: number;
    staffAssigned: string[];
    queue: WorkItem[];
    upgrades: string[];
    enabled: boolean;
    powerPriority: number;
    name?: string;
    accessPoints?: SurfaceAccess[];
  }

  export interface UndergroundGateCycle {
    staffId: string;
    fromId: string;
    toId: string;
    phase: "equalizing" | "crossing" | "retreating";
    remaining: number;
  }

  export interface UndergroundGate {
    id: string;
    roomAId: string;
    roomBId: string;
    kind: "door" | "airlock";
    enabled: boolean;
    minClearance: 0 | 1 | 2 | 3 | 4 | 5;
    direction: "both" | "a-to-b" | "b-to-a";
    powered: boolean;
    airSupply: boolean;
    queueCapacity: number;
    queue: string[];
    cycle?: UndergroundGateCycle;
    passedCount: number;
    paidFunds: number;
    paidParts: number;
  }


  /** Installed cable/pipe/duct bundle between two physically adjacent modules. */
  export interface UndergroundConduit {
    roomAId: string;
    roomBId: string;
    power: boolean;
    water: boolean;
    air: boolean;
    paidFunds: number;
    paidParts: number;
  }

  export interface UndergroundRoom {
    id: string;
    type: UndergroundRoomType;
    x: number;
    level: number;
    /** Transverse coordinate; omitted in historical one-section saves. */
    y?: number;
    width: number;
    condition: number;
    staffAssigned: string[];
    scpId?: string;
    upgrades: string[];
    enabled: boolean;
    powerPriority: number;
    sealed: boolean;
    name?: string;
  }

  export interface SkillSet {
    research: number;
    security: number;
    engineering: number;
    medicine: number;
    logistics: number;
    administration: number;
    memetics: number;
  }

  export interface StaffNeeds {
    fatigue: number;
    hunger: number;
    stress: number;
    morale: number;
    health: number;
    contamination: number;
  }

  export interface StaffMember {
    id: string;
    name: string;
    role: StaffRole;
    clearance: 0 | 1 | 2 | 3 | 4 | 5;
    salary: number;
    skills: SkillSet;
    traits: string[];
    needs: StaffNeeds;
    status: StaffStatus;
    position: LayerPoint;
    target?: LayerPoint;
    targetRoomId?: string;
    assignmentRoomId?: string;
    path: Point[];
    pathIndex: number;
    shift: "day" | "night";
    experience: number;
    loyalty: number;
    compromised: boolean;
    taskProgress: number;
    routeBlockedReason?: string;
    /** Physical crossing between adjacent underground rows, persisted mid-step. */
    undergroundLink?: { fromId: string; toId: string; crossingX: number };
  }

  export interface WorkItem {
    id: string;
    kind: "access" | "patient" | "delivery" | "anomaly" | "repair" | "research" | "training" | "inspection";
    severity: number;
    progress: number;
    createdAt: number;
    expiresAt: number;
    source?: string;
    metadata?: Record<string, string | number | boolean>;
  }

  export interface SCPRequirements {
    roomTags: string[];
    minContainment: number;
    minSecurity: number;
    powerReliability: number;
    staff: Partial<Record<StaffRole, number>>;
    suppliesPerDay: Partial<Record<ResourceKey, number>>;
    procedureFlags: string[];
  }

  export interface SCPDefinition {
    id: string;
    designation: string;
    name: string;
    objectClass: ObjectClass;
    icon: string;
    description: string;
    risk: number;
    disruption: number;
    requirements: SCPRequirements;
    researchValue: number;
    moraleEffect: number;
    uniqueRule: string;
    unlockedAt: number;
  }

  export interface ProcedureState {
    id: string;
    scpId: string;
    version: number;
    observationLevel: number;
    assignedStaff: number;
    maintenanceFrequency: number;
    backupPower: boolean;
    analogBackup: boolean;
    biometricMonitoring: boolean;
    opticalMonitoring: boolean;
    automatedLockdown: boolean;
    humaneCare: boolean;
    restrictedTesting: boolean;
    isolatedNetwork: boolean;
    redundantVentilation: boolean;
    trainingRequired: number;
    notes: string;
    compliance: number;
    complexity: number;
  }

  export interface SCPInstance {
    id: string;
    definitionId: string;
    contained: boolean;
    discovered: boolean;
    roomId?: string;
    researchProgress: number;
    knowledge: number;
    breachRisk: number;
    mood: number;
    health: number;
    activeEffect: string;
    procedureId: string;
    daysContained: number;
    incidents: number;
    transferred: boolean;
  }

  export interface ResearchNode {
    id: string;
    name: string;
    description: string;
    cost: number;
    prerequisites: string[];
    unlocks: string[];
    completed: boolean;
    category: "infrastructure" | "containment" | "medical" | "security" | "memetics" | "logistics";
  }

  export interface EventChoice {
    id: string;
    label: string;
    description: string;
    cost?: Cost;
    effects: EventEffect[];
    requirement?: string;
  }

  export interface EventEffect {
    type: "resource" | "reputation" | "queue" | "crisis" | "staff" | "scp" | "flag" | "log";
    key?: string;
    amount?: number;
    value?: string | number | boolean;
    target?: string;
  }

  export interface GameEvent {
    id: string;
    templateId: string;
    title: string;
    body: string;
    severity: EventSeverity;
    choices: EventChoice[];
    createdAt: number;
    resolved: boolean;
    blocking: boolean;
  }

  export interface CrisisZone {
    id: string;
    name: string;
    layer: Layer;
    level?: number;
    security: number;
    population: number;
    casualties: number;
    contamination: number;
    power: number;
    sealed: boolean;
    evacuated: boolean;
    threat: number;
  }

  export interface CrisisOrder {
    id: string;
    type: CrisisOrderType;
    zoneId: string;
    progress: number;
    duration: number;
    assigned: number;
    status: "queued" | "active" | "completed" | "failed";
  }

  export interface CrisisState {
    active: boolean;
    type: string;
    title: string;
    description: string;
    severity: number;
    elapsed: number;
    siteIntegrity: number;
    veilExposure: number;
    threatProgress: number;
    sourceScpId?: string;
    zones: CrisisZone[];
    orders: CrisisOrder[];
    log: string[];
    resolved?: "success" | "failure";
  }

  export interface CampaignObjective {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    complete: boolean;
    reward: Cost;
    condition: string;
  }

  export interface CampaignChapter {
    id: string;
    index: number;
    title: string;
    briefing: string;
    objectives: CampaignObjective[];
    unlockedScps: string[];
    rewardText: string;
    complete: boolean;
  }

  export interface Notification {
    id: string;
    time: number;
    title: string;
    message: string;
    severity: EventSeverity;
    read: boolean;
  }

  export interface GameSettings {
    difficulty: Difficulty;
    reducedMotion: boolean;
    highContrast: boolean;
    audio: boolean;
    autoPauseCritical: boolean;
    tutorial: boolean;
    language: "fr";
  }

  export interface CameraState {
    zoom: number;
    offsetX: number;
    offsetY: number;
  }

  export interface BuildSelection {
    layer: Layer;
    type: BuildType;
    rotation: number;
  }

  export interface GameState {
    version: string;
    savedAt: number;
    seed: number;
    mode: "campaign" | "sandbox";
    settings: GameSettings;
    view: ViewMode;
    speed: GameSpeed;
    previousSpeed: GameSpeed;
    day: number;
    minuteOfDay: number;
    elapsedMinutes: number;
    resources: ResourceState;
    reputation: ReputationState;
    regionWidth: number;
    regionHeight: number;
    surfaceWidth: number;
    surfaceHeight: number;
    undergroundWidth: number;
    undergroundLevels: number;
    regionFacilities: RegionFacility[];
    surfaceRooms: SurfaceRoom[];
    undergroundRooms: UndergroundRoom[];
    /** Configured physical junctions; absent on old saves. */
    undergroundGates?: UndergroundGate[];
    /** True physical service circuits, no automatic links for new modules. */
    undergroundConduits?: UndergroundConduit[];
    /** Region annex whose derived interior is currently being inspected. */
    activeInteriorFacilityId?: string;
    staff: StaffMember[];
    workItems: WorkItem[];
    scps: SCPInstance[];
    procedures: ProcedureState[];
    researchNodes: ResearchNode[];
    events: GameEvent[];
    currentEventId?: string;
    crisis: CrisisState;
    campaign: CampaignChapter[];
    currentChapter: number;
    notifications: Notification[];
    history: string[];
    flags: Record<string, boolean | number | string>;
    selectedId?: string;
    selectedType?: "facility" | "surface-room" | "underground-room" | "staff" | "scp" | "zone";
    buildSelection?: BuildSelection;
    camera: Record<ViewMode, CameraState>;
    lastAutosave: number;
    gameOver: boolean;
    victory: boolean;
  }

  export interface RuntimeState {
    state: GameState;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    lastFrame: number;
    accumulator: number;
    hoveredCell?: Point;
    pointerDown: boolean;
    dragStart?: Point;
    uiDirty: boolean;
    canvasDirty: boolean;
    animationFrame: number;
  }
}

