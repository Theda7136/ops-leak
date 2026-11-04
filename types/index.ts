export const SEVERITIES = ["LOW", "MEDIUM", "CRITICAL"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const BOTTLENECK_TYPES = [
  "MATERIAL_DELAY",
  "EQUIPMENT_FAILURE",
  "LABOR_IDLE",
  "WEATHER",
  "OTHER",
] as const;
export type BottleneckType = (typeof BOTTLENECK_TYPES)[number];

export const PROJECT_STATUSES = ["ACTIVE", "AT_RISK", "COMPLETED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type OperationalStatus = "normal" | "watch" | "critical" | "unknown";

export interface ProjectContext {
  name: string;
  clientName: string;
  totalBudget: number;
  status: ProjectStatus;
  spentToDate: number;
  hoursLogged: number;
  materialCosts: number;
}

export interface DailyReportAnalysis {
  summary: string;
  hoursLost: number;
  costImpact: number;
  severity: Severity;
  bottleneckType: BottleneckType;
  actionRecommended: string;
}

export interface ProjectProgress {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  totalBudget: number;
  spent: number;
  ratio: number | null;
  startDate: Date;
  estimatedEndDate: Date;
}

export interface OperationalAlertItem {
  id: string;
  projectName: string;
  severity: Severity;
  bottleneckType: BottleneckType;
  summary: string;
  actionRecommended: string;
  createdAt: Date;
}

export interface ExecutiveDashboard {
  totalBudget: number;
  totalSpent: number;
  budgetStatus: OperationalStatus;
  projectsAtRisk: number;
  projectsAtRiskStatus: OperationalStatus;
  criticalAlerts: number;
  criticalAlertsStatus: OperationalStatus;
  activeProjects: ProjectProgress[];
  alerts: OperationalAlertItem[];
  dataSource: "database" | "unavailable";
}

export interface ReportProjectOption {
  id: string;
  name: string;
  clientName: string;
}

export interface ReportActionResult {
  ok: boolean;
  message: string;
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  LOW: "Normal",
  MEDIUM: "Riesgo moderado",
  CRITICAL: "Riesgo crítico",
};

export const BOTTLENECK_LABELS: Record<BottleneckType, string> = {
  MATERIAL_DELAY: "Retraso de material",
  EQUIPMENT_FAILURE: "Falla de equipo",
  LABOR_IDLE: "Mano de obra ociosa",
  WEATHER: "Clima",
  OTHER: "Otro",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "Activo",
  AT_RISK: "En riesgo",
  COMPLETED: "Completado",
};

export const DISPLAY_CURRENCY = "USD";
