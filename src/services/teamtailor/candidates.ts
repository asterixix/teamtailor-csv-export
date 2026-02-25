import type {
  JsonApiResponse,
  CandidateResource,
  JobApplicationResource,
  CsvRow,
} from './types.js';
import { teamtailorFetchByUrl } from './client.js';
import { config } from '../../config.js';

/**
 * Fetches all candidates with their job applications efficiently
 * Uses ?include=job-applications to fetch candidates and applications in one paginated call
 * Yields arrays of CsvRow per page until all candidates are exhausted
 *
 * @returns AsyncGenerator yielding arrays of CsvRow objects
 */
export async function* streamCandidateCsvRows(): AsyncGenerator<CsvRow[]> {
  let nextUrl: string | null | undefined = buildInitialUrl();

  while (nextUrl) {
    const response: JsonApiResponse<CandidateResource> =
      await teamtailorFetchByUrl<JsonApiResponse<CandidateResource>>(nextUrl);

    // Build lookup map from included job applications
    const appLookupMap = buildJobApplicationsLookup(response.included);

    // Convert candidates to CSV rows
    const rows: CsvRow[] = response.data
      .map((candidate: CandidateResource) => candidateToRows(candidate, appLookupMap))
      .flat();

    // Yield the rows for this page
    yield rows;

    // Follow the next link
    nextUrl = response.links?.next;
  }
}

/**
 * Builds the initial API URL with sparse fieldsets and pagination
 */
function buildInitialUrl(): string {
  const fields = [
    'fields[candidates]=first-name,last-name,email,job-applications',
    'fields[job-applications]=created-at',
    `page[size]=${config.teamtailor.pageSize}`,
    'include=job-applications',
  ].join('&');

  return `${config.teamtailor.baseUrl}/candidates?${fields}`;
}

/**
 * Builds a lookup map of job applications by their ID
 * Returns a map from job application ID to job application resource
 */
function buildJobApplicationsLookup(
  included: JsonApiResponse['included'] | undefined
): Map<string, JobApplicationResource> {
  const map = new Map<string, JobApplicationResource>();

  if (!included) {
    return map;
  }

  for (const resource of included) {
    if (resource.type === 'job-applications') {
      const jobApp = resource as unknown as JobApplicationResource;
      map.set(String(jobApp.id), jobApp);
    }
  }

  return map;
}

/**
 * Converts a candidate resource to CSV rows
 * Creates one row per job application, or one empty row if no applications
 */
function candidateToRows(
  candidate: CandidateResource,
  jobAppMap: Map<string, JobApplicationResource>
): CsvRow[] {
  const jobAppsRelationship = candidate.relationships?.['job-applications'];

  if (jobAppsRelationship && 'data' in jobAppsRelationship) {
    const jobAppData = jobAppsRelationship.data;
    if (Array.isArray(jobAppData) && jobAppData.length > 0) {
      // Create one row per job application
      return jobAppData
        .filter(item => item.type === 'job-applications')
        .map(item => {
          const jobApp = jobAppMap.get(String(item.id));
          return {
            candidate_id: candidate.id,
            first_name: candidate.attributes['first-name'],
            last_name: candidate.attributes['last-name'],
            email: candidate.attributes.email,
            job_application_id: jobApp ? jobApp.id : '',
            job_application_created_at: jobApp ? jobApp.attributes['created-at'] : '',
          };
        });
    }
  }

  // Candidate with no applications: emit one row with empty app fields
  return [
    {
      candidate_id: candidate.id,
      first_name: candidate.attributes['first-name'],
      last_name: candidate.attributes['last-name'],
      email: candidate.attributes.email,
      job_application_id: '',
      job_application_created_at: '',
    },
  ];
}
