// Definición de las características disponibles en la aplicación
export type FeatureKey =
  | "transactions_limit"
  | "accounts_limit"
  | "advanced_analytics"
  | "custom_reports"
  | "real_time_tracking"
  | "data_export"
  | "ai_insights"
  | "custom_categories"
  | "budget_planning"
  | "investment_tracking"
  | "multi_currency"
  | "priority_support"

// Configuración de límites para características numéricas
export type FeatureLimits = {
  [key in FeatureKey]?: number
}

// Configuración de características booleanas (disponible o no)
export type FeatureAvailability = {
  [key in FeatureKey]?: boolean
}

// Definición de los planes y sus características
export const PLAN_FEATURES: Record<string, FeatureAvailability & FeatureLimits> = {
  free: {
    transactions_limit: 50,
    accounts_limit: 1,
    advanced_analytics: false,
    custom_reports: false,
    real_time_tracking: false,
    data_export: false,
    ai_insights: false,
    custom_categories: false,
    budget_planning: true,
    investment_tracking: false,
    multi_currency: false,
    priority_support: false,
  },
  pro: {
    transactions_limit: 1000,
    accounts_limit: 5,
    advanced_analytics: true,
    custom_reports: true,
    real_time_tracking: true,
    data_export: true,
    ai_insights: false,
    custom_categories: true,
    budget_planning: true,
    investment_tracking: true,
    multi_currency: false,
    priority_support: true,
  },
  premium: {
    transactions_limit: Number.POSITIVE_INFINITY,
    accounts_limit: Number.POSITIVE_INFINITY,
    advanced_analytics: true,
    custom_reports: true,
    real_time_tracking: true,
    data_export: true,
    ai_insights: true,
    custom_categories: true,
    budget_planning: true,
    investment_tracking: true,
    multi_currency: true,
    priority_support: true,
  },
}

// Nombres amigables para las características
export const FEATURE_NAMES: Record<FeatureKey, string> = {
  transactions_limit: "Límite de transacciones",
  accounts_limit: "Límite de cuentas",
  advanced_analytics: "Análisis avanzado",
  custom_reports: "Informes personalizados",
  real_time_tracking: "Seguimiento en tiempo real",
  data_export: "Exportación de datos",
  ai_insights: "Insights con IA",
  custom_categories: "Categorías personalizadas",
  budget_planning: "Planificación de presupuesto",
  investment_tracking: "Seguimiento de inversiones",
  multi_currency: "Multi-divisa",
  priority_support: "Soporte prioritario",
}

// Función para verificar si una característica está disponible para un plan
export function isFeatureAvailable(featureKey: FeatureKey, userPlan = "free"): boolean {
  const planFeatures = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free
  return !!planFeatures[featureKey]
}

// Función para obtener el límite de una característica para un plan
export function getFeatureLimit(featureKey: FeatureKey, userPlan = "free"): number {
  const planFeatures = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free
  return typeof planFeatures[featureKey] === "number" ? (planFeatures[featureKey] as number) : 0
}

// Función para verificar si un usuario ha alcanzado el límite de una característica
export function hasReachedLimit(featureKey: FeatureKey, currentCount: number, userPlan = "free"): boolean {
  const limit = getFeatureLimit(featureKey, userPlan)
  return currentCount >= limit
}

// Función para obtener el plan mínimo requerido para una característica
export function getRequiredPlanForFeature(featureKey: FeatureKey): string {
  if (isFeatureAvailable(featureKey, "free")) return "free"
  if (isFeatureAvailable(featureKey, "pro")) return "pro"
  if (isFeatureAvailable(featureKey, "premium")) return "premium"
  return "premium" // Si no está disponible en ningún plan, asumimos premium
}

// Función para obtener el nombre amigable de un plan
export function getPlanName(planId = "free"): string {
  switch (planId) {
    case "free":
      return "Free"
    case "pro":
      return "Pro"
    case "premium":
      return "Premium"
    default:
      return "Free"
  }
}
