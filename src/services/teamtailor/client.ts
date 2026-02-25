import { config } from '../../config.js';

/**
 * Custom error class for Teamtailor API responses
 * Includes status code for error handling
 */
export class TeamtailorApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'TeamtailorApiError';
  }
}

/**
 * Builds query string from parameters
 * @param params - Object with query parameters
 * @returns Query string (without leading ?)
 */
function buildQueryString(params?: Record<string, string | number | boolean>): string {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  return searchParams.toString();
}

/**
 * Builds common Teamtailor API headers with authentication
 * @returns Headers object with auth and API version
 */
function buildHeaders(): HeadersInit {
  return {
    Authorization: `Token token=${config.teamtailor.apiKey}`,
    'X-Api-Version': config.teamtailor.apiVersion,
    Accept: 'application/vnd.api+json',
  };
}

/**
 * Fetches data from Teamtailor API with automatic URL construction
 * @template T - The expected response data type
 * @param path - API endpoint path (relative to base URL)
 * @param params - Query parameters
 * @returns Parsed response data
 * @throws TeamtailorApiError if response is not ok
 */
export async function teamtailorFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const queryString = buildQueryString(params);
  const url = `${config.teamtailor.baseUrl}${path}${queryString ? `?${queryString}` : ''}`;

  return teamtailorFetchByUrl<T>(url);
}

/**
 * Fetches data from a complete Teamtailor API URL
 * Used for following pagination links from API responses
 * @template T - The expected response data type
 * @param url - Complete URL to fetch
 * @returns Parsed response data
 * @throws TeamtailorApiError if response is not ok
 */
export async function teamtailorFetchByUrl<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    // Read the response body once as text first
    const errorText = await response.text();
    let errorBody: unknown;
    try {
      // Try to parse as JSON
      errorBody = JSON.parse(errorText);
    } catch {
      // If JSON parsing fails, use the raw text
      errorBody = errorText;
    }

    throw new TeamtailorApiError(
      `Teamtailor API request failed: ${response.statusText}`,
      response.status,
      errorBody
    );
  }

  // Read the response body once for successful responses
  return response.json() as Promise<T>;
}
