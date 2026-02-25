import type {
  JsonApiResponse,
  JsonApiResource,
  CandidateResource,
  JobApplicationAttributes,
  JobApplicationRelationships,
  CsvRow,
} from './types.js';
import { teamtailorFetchByUrl } from './client.js';
import { config } from '../../config.js';
import logger from '../../shared/logger.js';

/**
 * Fetches all candidates with their job applications efficiently
 * Uses ?include=job-applications to fetch candidates and applications in one paginated call
 * Yields arrays of CsvRow per page until all candidates are exhausted
 *
 * @returns AsyncGenerator yielding arrays of CsvRow objects
 */
export async function* streamCandidateCsvRows(): AsyncGenerator<CsvRow[]> {
  let nextUrl: string | null | undefined = buildInitialUrl();
  let totalPages = 0;
  let totalCandidates = 0;

  while (nextUrl) {
    const response: JsonApiResponse<CandidateResource> =
      await teamtailorFetchByUrl<JsonApiResponse<CandidateResource>>(nextUrl);

    const appLookupMap = buildJobApplicationsLookup(response.included);

    const rows: CsvRow[] = response.data
      .map((candidate: CandidateResource) => candidateToRows(candidate, appLookupMap))
      .flat();

    totalPages += 1;
    totalCandidates += response.data.length;

    yield rows;

    nextUrl = response.links?.next;
  }

  logger.info(`Export completed: ${totalCandidates} candidates across ${totalPages} pages`);
}

/**
 * Builds the initial API URL with sparse fieldsets and pagination
 */
function buildInitialUrl(): string {
  const url = new URL(`${config.teamtailor.baseUrl}/candidates`);
  const params = new URLSearchParams();

  params.append('fields[candidates]', 'first-name,last-name,email,job-applications');
  params.append('fields[job-applications]', 'created-at');
  params.append('page[size]', String(config.teamtailor.pageSize));
  params.append('include', 'job-applications');

  url.search = params.toString();
  return url.toString();
}

/**
 * Builds a lookup map of job applications by their ID
 * Returns a map from job application ID to job application resource
 */
function buildJobApplicationsLookup(
  included: JsonApiResponse['included'] | undefined
): Map<string, JsonApiResource<JobApplicationAttributes, JobApplicationRelationships>> {
  const map = new Map<
    string,
    JsonApiResource<JobApplicationAttributes, JobApplicationRelationships>
  >();

  if (!included) {
    return map;
  }

  for (const resource of included) {
    if (resource.type === 'job-applications') {
      map.set(
        String(resource.id),
        resource as unknown as JsonApiResource<
          JobApplicationAttributes,
          JobApplicationRelationships
        >
      );
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
  jobAppMap: Map<string, JsonApiResource<JobApplicationAttributes, JobApplicationRelationships>>
): CsvRow[] {
  const jobAppsRelationship = candidate.relationships?.['job-applications'];

  if (jobAppsRelationship && 'data' in jobAppsRelationship) {
    const jobAppData = jobAppsRelationship.data;
    if (Array.isArray(jobAppData) && jobAppData.length > 0) {
      return jobAppData
        .filter(item => item.type === 'job-applications')
        .map(item => {
          const jobApp = jobAppMap.get(String(item.id));
          return {
            candidate_id: String(candidate.id),
            first_name: candidate.attributes['first-name'],
            last_name: candidate.attributes['last-name'],
            email: candidate.attributes.email,
            job_application_id: jobApp ? String(jobApp.id) : '',
            job_application_created_at: jobApp ? jobApp.attributes['created-at'] : '',
          };
        });
    }
  }

  return [
    {
      candidate_id: String(candidate.id),
      first_name: candidate.attributes['first-name'],
      last_name: candidate.attributes['last-name'],
      email: candidate.attributes.email,
      job_application_id: '',
      job_application_created_at: '',
    },
  ];
}
