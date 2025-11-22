/**
 * API Configuration
 * Centralized API URLs and endpoints configuration
 */

/**
 * Get the backend API base URL
 * FINAL FIX: Hardcoded secure production domain to bypass environment variable precedence issues
 * in the Next.js compilation cache.
 * 
 * NOTE: This is a temporary solution to resolve runtime environment variable reading issues.
 * The production URL is hardcoded to ensure reliable API connectivity.
 */
export function getApiUrl(): string {
  // FINAL FIX: We hardcode the secure domain to bypass environment variable precedence issues in the Next.js compilation cache.
  return "https://api.baibussines.com";
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
  return getApiUrl();
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
