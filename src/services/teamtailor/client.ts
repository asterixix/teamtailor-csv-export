import { config } from '../../config.js';

const FETCH_TIMEOUT_MS = 30_000;

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

function buildHeaders(): HeadersInit {
  return {
    Authorization: `Token token=${config.teamtailor.apiKey}`,
    'X-Api-Version': config.teamtailor.apiVersion,
    Accept: 'application/vnd.api+json',
  };
}

export async function teamtailorFetchByUrl<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorBody: unknown;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = errorText;
      }

      throw new TeamtailorApiError(
        `Teamtailor API request failed: ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TeamtailorApiError(
        `Teamtailor API request timed out after ${FETCH_TIMEOUT_MS}ms`,
        408,
        { timeout: FETCH_TIMEOUT_MS }
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
