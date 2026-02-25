import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../server.js';
import * as candidatesModule from '../services/teamtailor/candidates.js';
import { TeamtailorApiError } from '../services/teamtailor/client.js';

vi.mock('../services/teamtailor/candidates.js');

const mockStreamCandidateCsvRows = vi.mocked(candidatesModule.streamCandidateCsvRows);

describe('Export Routes - Integration Tests', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 with ok status and timestamp', async () => {
      const res = await supertest(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });
  });

  describe('GET /api-docs.json', () => {
    it('should return 200 with OpenAPI specification', async () => {
      const res = await supertest(app).get('/api-docs.json');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      expect(res.body).toHaveProperty('openapi', '3.0.0');
      expect(res.body).toHaveProperty('info');
      expect(res.body.info).toHaveProperty('title', 'Teamtailor CSV Export API');
    });
  });

  describe('GET /api/export/candidates', () => {
    it('should return 200 with text/csv content-type', async () => {
      mockStreamCandidateCsvRows.mockImplementation(async function* () {
        yield [
          {
            candidate_id: '123',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            job_application_id: '456',
            job_application_created_at: '2024-01-15T10:00:00Z',
          },
        ];
      });

      const res = await supertest(app).get('/api/export/candidates');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
    });

    it('should set Content-Disposition header with attachment filename', async () => {
      mockStreamCandidateCsvRows.mockImplementation(async function* () {
        yield [];
      });

      const res = await supertest(app).get('/api/export/candidates');

      expect(res.status).toBe(200);
      expect(res.headers['content-disposition']).toMatch(
        /^attachment; filename="candidates-\d{4}-\d{2}-\d{2}\.csv"$/
      );
    });

    it('should include CSV headers in response', async () => {
      mockStreamCandidateCsvRows.mockImplementation(async function* () {
        yield [
          {
            candidate_id: '123',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            job_application_id: '456',
            job_application_created_at: '2024-01-15T10:00:00Z',
          },
        ];
      });

      const res = await supertest(app).get('/api/export/candidates');

      expect(res.status).toBe(200);
      const csvLines = res.text.split('\n');
      expect(csvLines[0]).toBe(
        'candidate_id,first_name,last_name,email,job_application_id,job_application_created_at'
      );
    });

    it('should return CSV data rows', async () => {
      mockStreamCandidateCsvRows.mockImplementation(async function* () {
        yield [
          {
            candidate_id: '123',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            job_application_id: '456',
            job_application_created_at: '2024-01-15T10:00:00Z',
          },
        ];
      });

      const res = await supertest(app).get('/api/export/candidates');

      expect(res.status).toBe(200);
      const csvLines = res.text.split('\n');
      expect(csvLines[1]).toContain('123');
      expect(csvLines[1]).toContain('John');
      expect(csvLines[1]).toContain('Doe');
      expect(csvLines[1]).toContain('john@example.com');
    });

    it('should handle multiple pages of data', async () => {
      mockStreamCandidateCsvRows.mockImplementation(async function* () {
        yield [
          {
            candidate_id: '1',
            first_name: 'A',
            last_name: 'B',
            email: 'a@b.com',
            job_application_id: '',
            job_application_created_at: '',
          },
        ];
        yield [
          {
            candidate_id: '2',
            first_name: 'C',
            last_name: 'D',
            email: 'c@d.com',
            job_application_id: '',
            job_application_created_at: '',
          },
        ];
      });

      const res = await supertest(app).get('/api/export/candidates');

      expect(res.status).toBe(200);
      const csvLines = res.text.split('\n').filter(line => line.trim());
      expect(csvLines.length).toBe(3); // header + 2 data rows
    });

    it('should return 502 when TeamtailorApiError is thrown', async () => {
      // eslint-disable-next-line require-yield
      mockStreamCandidateCsvRows.mockImplementation(async function* () {
        throw new TeamtailorApiError('API request failed', 404, { error: 'Not found' });
      });

      const res = await supertest(app).get('/api/export/candidates');

      expect(res.status).toBe(502);
      expect(res.body).toHaveProperty('error', 'Bad Gateway');
      expect(res.body).toHaveProperty('message');
    });

    it('should return 500 for generic errors', async () => {
      // eslint-disable-next-line require-yield
      mockStreamCandidateCsvRows.mockImplementation(async function* () {
        throw new Error('Unexpected error');
      });

      const res = await supertest(app).get('/api/export/candidates');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Internal Server Error');
    });

    it('should set Cache-Control to no-cache', async () => {
      mockStreamCandidateCsvRows.mockImplementation(async function* () {
        yield [];
      });

      const res = await supertest(app).get('/api/export/candidates');

      expect(res.headers['cache-control']).toBe('no-cache');
    });
  });
});
