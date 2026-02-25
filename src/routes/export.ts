import { Router } from 'express';
import { stringify } from 'csv-stringify';
import { streamCandidateCsvRows } from '../services/teamtailor/candidates.js';
import { TeamtailorApiError } from '../services/teamtailor/client.js';
import { CSV_HEADERS } from '../services/teamtailor/types.js';
import logger from '../shared/logger.js';

export const exportRouter = Router();

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
      res.removeHeader('Content-Type');
      res.removeHeader('Content-Disposition');
      if (error instanceof TeamtailorApiError) {
        res.status(502).json({
          error: 'Bad Gateway',
          message: error.message,
          status: error.status,
        });
      } else {
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
