/**
 * API Configuration
 * Centralized API URLs and endpoints configuration
 */

/**
 * Get the backend API base URL from environment variable
 * CRITICAL: No hardcoded fallbacks - relies entirely on process.env.NEXT_PUBLIC_API_URL
 * In development, docker-compose.yml sets NEXT_PUBLIC_API_URL=http://localhost:8000
 * In production, set NEXT_PUBLIC_API_URL=https://api.baibussines.com via environment variables
 * @throws Error if NEXT_PUBLIC_API_URL is not configured
 */
export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl || apiUrl.trim() === "") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. " +
      "Please set NEXT_PUBLIC_API_URL environment variable. " +
      "For development: http://localhost:8000 (set in docker-compose.yml). " +
      "For production: https://api.baibussines.com (set via deployment environment)."
    );
  }
  
  return apiUrl.trim();
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
