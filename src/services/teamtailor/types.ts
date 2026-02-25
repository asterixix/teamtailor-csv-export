/**
 * JSON:API Type Definitions
 * Implements the JSON:API specification: https://jsonapi.org/
 */

/**
 * JSON:API relationship data object
 * Can be a single resource or array of resources
 */
export interface JsonApiRelationshipData {
  type: string;
  id: string | number;
}

/**
 * JSON:API relationship object
 * Contains links and data about related resources
 */
export interface JsonApiRelationship {
  data?: JsonApiRelationshipData | JsonApiRelationshipData[];
  links?: Record<string, string>;
}

/**
 * JSON:API links object
 * Contains URLs for related resources
 */
export interface JsonApiLinks {
  self?: string;
  related?: string;
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
  [key: string]: string | undefined;
}

/**
 * Generic JSON:API resource object
 * @template TAttributes - The shape of the resource's attributes
 * @template TRelationships - The shape of the resource's relationships
 */
export interface JsonApiResource<
  TAttributes = Record<string, unknown>,
  TRelationships extends Record<string, unknown> = Record<string, never>,
> {
  type: string;
  id: string | number;
  attributes: TAttributes;
  relationships?: TRelationships;
  links?: JsonApiLinks;
}

/**
 * JSON:API response wrapper
 * Can contain a single resource, multiple resources, or errors
 */
export interface JsonApiResponse<TData = Record<string, unknown>> {
  data: TData[];
  included?: JsonApiResource[];
  links?: JsonApiLinks;
  meta?: Record<string, unknown>;
  errors?: Array<{
    status?: string;
    code?: string;
    title?: string;
    detail?: string;
  }>;
}

/**
 * Candidate attributes from Teamtailor API
 */
export interface CandidateAttributes {
  'first-name': string;
  'last-name': string;
  email: string;
  [key: string]: unknown;
}

/**
 * Candidate relationships
 */
export interface CandidateRelationships {
  'job-applications'?: JsonApiRelationship;
  [key: string]: JsonApiRelationship | undefined;
}

/**
 * Candidate resource
 */
export type CandidateResource = JsonApiResource<CandidateAttributes, CandidateRelationships>;

/**
 * Job application attributes from Teamtailor API
 */
export interface JobApplicationAttributes {
  'created-at': string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Job application relationships
 */
export interface JobApplicationRelationships {
  candidate?: JsonApiRelationship;
  job?: JsonApiRelationship;
  [key: string]: JsonApiRelationship | undefined;
}

/**
 * Job application resource
 */
export type JobApplicationResource = JsonApiResource<
  JobApplicationAttributes,
  JobApplicationRelationships
>;

/**
 * CSV export row structure
 * Flattened representation of candidate and job application data
 */
export interface CsvRow {
  candidate_id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_application_id: string;
  job_application_created_at: string;
}

export const CSV_HEADERS: (keyof CsvRow)[] = [
  'candidate_id',
  'first_name',
  'last_name',
  'email',
  'job_application_id',
  'job_application_created_at',
];
