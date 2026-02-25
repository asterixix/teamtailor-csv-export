import { Router } from 'express';
import { stringify } from 'csv-stringify';
import { streamCandidateCsvRows } from '../services/teamtailor/candidates.js';
import { TeamtailorApiError } from '../services/teamtailor/client.js';
import type { CsvRow } from '../services/teamtailor/types.js';
import logger from '../shared/logger.js';

/**
 * Export Router
 * Routes for CSV export functionality
 */
export const exportRouter = Router();

const CSV_HEADERS: (keyof CsvRow)[] = [
  'candidate_id',
  'first_name',
  'last_name',
  'email',
  'job_application_id',
  'job_application_created_at',
];

/**
 * Export candidates as CSV
 * @route GET /api/export/candidates
 * @group Export - CSV export operations
 * @returns {string} 200 - CSV file download
 * @returns {object} 502 - Teamtailor API error
 * @returns {object} 500 - Internal server error
 * @produces text/csv
 * @security teamtailorApiKey
 */
exportRouter.get('/candidates', async (_req, res) => {
  const filename = `candidates-${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');

  const stringifier = stringify({
    header: true,
    columns: CSV_HEADERS,
  });

  let hasError = false;

  stringifier.on('error', err => {
    logger.error('CSV stringifier error:', err);
    hasError = true;
  });

  stringifier.pipe(res);

  try {
    for await (const rows of streamCandidateCsvRows()) {
      if (hasError) break;
      for (const row of rows) {
        if (!stringifier.write(row)) {
          await new Promise<void>(resolve => stringifier.once('drain', resolve));
        }
      }
    }
  } catch (error) {
    logger.error('Export error:', error);

    if (!res.headersSent) {
      stringifier.destroy();
      if (error instanceof TeamtailorApiError) {
        res.removeHeader('Content-Type');
        res.removeHeader('Content-Disposition');
        res.status(502).json({
          error: 'Bad Gateway',
          message: error.message,
          status: error.status,
        });
      } else {
        res.removeHeader('Content-Type');
        res.removeHeader('Content-Disposition');
        res.status(500).json({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      return;
    }

    res.end();
    return;
  }

  if (!hasError) {
    stringifier.end();
  }
});
