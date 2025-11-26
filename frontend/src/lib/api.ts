/**
 * API Configuration
 * Centralized API URLs and endpoints configuration
 */

/**
 * Get the backend API base URL
 * Uses NEXT_PUBLIC_API_URL environment variable if it exists.
 * Falls back to localhost:8000 ONLY if the env var is missing (development default).
 */
export function getApiUrl(): string {
  // Use environment variable if set, otherwise fallback to localhost for development
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

/**
 * Get the chat endpoint URL
 */
export function getChatApiUrl(): string {
  return `${getApiUrl()}/api/chat`;
}

/**
 * Get the health check endpoint URL
 */
export function getHealthCheckUrl(): string {
  return `${getApiUrl()}/health`;
}

/**
 * Get the chat history endpoint URL
 */
export function getChatHistoryUrl(): string {
  return `${getApiUrl()}/api/chat/history`;
}

/**
 * Get the authentication token endpoint URL
 */
export function getAuthTokenUrl(): string {
  return `${getApiUrl()}/api/auth/token`;
}

/**
 * Get the data logs endpoint URL
 */
export function getDataLogsUrl(): string {
  return `${getApiUrl()}/api/data/logs`;
}

/**
 * Get the current user profile endpoint URL
 */
export function getMeUrl(): string {
  return `${getApiUrl()}/api/auth/me`;
}

/**
 * Get the registration endpoint URL
 */
export function getRegisterUrl(): string {
  return `${getApiUrl()}/api/auth/register`;
}

/**
 * Get the billing upgrade endpoint URL
 */
export function getBillingUpgradeUrl(): string {
  return `${getApiUrl()}/api/billing/upgrade`;
}

/**
 * Get the Stripe checkout session creation endpoint URL
 */
export function getBillingCheckoutUrl(): string {
  return `${getApiUrl()}/api/billing/create-checkout`;
}

/**
 * Get the data mining report generation endpoint URL
 */
export function getMiningReportUrl(): string {
  return `${getApiUrl()}/api/data/mining-report`;
}
