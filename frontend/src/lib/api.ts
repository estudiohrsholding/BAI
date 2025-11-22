/**
 * API Configuration
 * Centralized API URLs and endpoints configuration
 */

/**
 * Get the backend API base URL from environment variable
 * Falls back to localhost:8000 for local development
 */
export function getApiUrl(): string {
  if (typeof window === "undefined") {
    // Server-side rendering - return default
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }
  
  // Client-side - check browser environment
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
