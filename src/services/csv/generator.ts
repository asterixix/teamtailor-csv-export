import { stringify, type Stringifier } from 'csv-stringify';
import type { Writable } from 'stream';
import { streamCandidateCsvRows } from '../teamtailor/candidates.js';
import type { CsvRow } from '../teamtailor/types.js';

/**
 * CSV column headers matching CsvRow keys
 */
export const CSV_HEADERS: (keyof CsvRow)[] = [
  'candidate_id',
  'first_name',
  'last_name',
  'email',
  'job_application_id',
  'job_application_created_at',
];

/**
 * Pipes candidate data as CSV to an output stream using streaming
 * Writes header row, then streams candidate rows from the async generator
 * Does NOT buffer all data in memory - pipes directly to output stream
 *
 * @param outputStream - Writable stream to pipe CSV data to (e.g., HTTP response)
 * @returns Promise that resolves when streaming is complete
 */
export async function pipeCandidatesCsvToStream(outputStream: Writable): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create stringifier with header row and column configuration
    const stringifier: Stringifier = stringify({
      header: true,
      columns: CSV_HEADERS,
    });

    // Pipe the stringifier output to the response stream
    stringifier.pipe(outputStream);

    // Handle stringifier errors
    stringifier.on('error', error => {
      reject(error);
    });

    // Handle output stream errors
    outputStream.on('error', error => {
      reject(error);
    });

    // Handle output stream finish event
    outputStream.on('finish', () => {
      resolve();
    });

    // Stream candidate rows from the async generator
    (async () => {
      try {
        for await (const rows of streamCandidateCsvRows()) {
          for (const row of rows) {
            stringifier.write(row);
          }
        }
        // End the stringifier to flush and close the stream
        stringifier.end();
      } catch (error) {
        stringifier.destroy();
        reject(error);
      }
    })();
  });
}
