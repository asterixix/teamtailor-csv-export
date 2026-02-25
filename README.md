# Teamtailor CSV Export

A high-performance Node.js application for exporting candidate data from Teamtailor as CSV files. Built with Express, TypeScript, and streaming for memory-efficient large dataset handling.

## AI Disclaimer

Built using Claude Sonnet 4.5 for base API planning, KAT Coder Pro V1 for development and testing, GLM 5 for quick fixes, and MCP Servers (Context7, Perplexity, Z.AI, GitHub, WebSearch, Fetch, Morph) for documentation research and analysis. All models run in OpenCode with OhMyOpenCode and custom agents for Planning, Coding, and Debugging.

## Features

- **Stream-based CSV export**: Memory-efficient handling of large datasets
- **Teamtailor API integration**: Proper authentication and pagination
- **Type-safe**: Full TypeScript support with strict mode
- **Error handling**: Comprehensive error handling with proper HTTP status codes
- **RESTful API**: Clean endpoints for CSV export and health checks
- **Tested**: Integration tests with Vitest and Supertest (10/10 passing)
- **Logging**: Winston application logging + Morgan request logging
- **Code Quality**: ESLint + Prettier with TypeScript rules
- **API Documentation**: Swagger UI with OpenAPI 3.0 specification
- **Robust**: 30-second fetch timeout, proper type guards, URLSearchParams for URL building

## Prerequisites

- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher
- **Teamtailor API Key**: From your Teamtailor account

## Installation

```bash
git clone <repository-url>
cd teamtailor-csv-export
npm install
cp .env.example .env
# Edit .env and add your Teamtailor API key
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API server port |
| `SWAGGER_PORT` | `3003` | Swagger UI server port |
| `TEAMTAILOR_API_KEY` | *required* | Your Teamtailor API key |
| `TEAMTAILOR_BASE_URL` | `https://api.teamtailor.com/v1` | Teamtailor API base URL |
| `TEAMTAILOR_API_VERSION` | `20240404` | X-Api-Version header value (date format) |
| `TEAMTAILOR_PAGE_SIZE` | `30` | Records per paginated request (max 30) |

> **Note**: The `TEAMTAILOR_API_VERSION` is the value sent in the `X-Api-Version` header. It must be a date string like `20240404`, not `v1` (which is the URL path segment).

## Running the Application

### Development

```bash
npm run dev           # API server only (port 3000)
npm run dev:swagger   # Swagger UI only (port 3003)
npm run dev:both      # Both servers simultaneously
```

### Production

```bash
npm run build
npm start             # API server
npm start:swagger     # Swagger UI server
npm start:both        # Both servers
```

## API Endpoints

### GET /health

Health check endpoint.

**Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### GET /api-docs.json

Returns the OpenAPI 3.0 specification.

### GET /api/export/candidates

Downloads all candidates as a CSV file.

**Response**: `200 OK`
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="candidates-YYYY-MM-DD.csv"`

**CSV Columns**:
| Column | Description |
|--------|-------------|
| `candidate_id` | Unique candidate identifier (string) |
| `first_name` | Candidate's first name |
| `last_name` | Candidate's last name |
| `email` | Candidate's email address |
| `job_application_id` | Associated job application ID (string, empty if none) |
| `job_application_created_at` | Application timestamp (ISO 8601, empty if none) |

**Error Responses**:
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid API key
- `408 Request Timeout` - API request timed out (30s limit)
- `502 Bad Gateway` - Teamtailor API error
- `500 Internal Server Error` - Unexpected server error

**Usage**:
```bash
curl -o candidates.csv http://localhost:3000/api/export/candidates
```

## Swagger UI

Interactive API documentation available at:
- **Swagger UI**: http://localhost:3003/api-docs
- **OpenAPI Spec**: http://localhost:3000/api-docs.json

## Development

### Commands

```bash
npm test              # Run test suite
npm run test:watch    # Watch mode
npm run lint          # ESLint check
npm run format        # Prettier format
npm run format:check  # Verify formatting
npm run build         # TypeScript compile
```

### Project Structure

```
src/
├── config.ts              # Environment configuration
├── index.ts               # Application entry point
├── server.ts              # Express app with conditional logging
├── swagger-server.ts      # Separate Swagger UI server
├── shared/
│   └── logger.ts          # Winston logger
├── routes/
│   ├── export.ts          # CSV export route handler
│   └── export.test.ts     # Integration tests
├── docs/
│   └── swagger.ts         # OpenAPI 3.0 specification
└── services/
    ├── csv/
    │   └── generator.ts   # CSV stringification
    └── teamtailor/
        ├── client.ts      # API client with timeout
        ├── candidates.ts  # Candidate streaming with logging
        └── types.ts       # TypeScript types + CSV_HEADERS
public/
└── index.html             # Landing page with download button
```

## How It Works

1. Client requests `/api/export/candidates`
2. Handler sets CSV headers and creates a streaming stringifier
3. `streamCandidateCsvRows()` fetches paginated data from Teamtailor API
4. Each page is converted to CSV rows and yielded to the stream
5. Response streams to client as chunked transfer
6. Export completion is logged with candidate/page counts

**Key design decisions**:
- Streaming keeps memory usage constant regardless of dataset size
- 30-second timeout prevents hanging requests
- `URLSearchParams` ensures proper URL encoding
- Type guards provide runtime type safety

## Troubleshooting

### "Missing required environment variable: TEAMTAILOR_API_KEY"
Copy `.env.example` to `.env` and add your API key.

### "401 Unauthorized"
Verify your `TEAMTAILOR_API_KEY` is correct and active.

### "408 Request Timeout"
The Teamtailor API did not respond within 30 seconds. Check your network connection.

### "502 Bad Gateway"
The Teamtailor API returned an error. Check the error message for details.

### Empty CSV or missing job application data
Ensure your Teamtailor account has candidates with job applications.

## Changelog

### Version 1.0.0
- Stream-based CSV export with memory efficiency
- Teamtailor API integration with pagination
- Integration tests with Supertest (10 tests)
- TypeScript strict mode
- Winston + Morgan logging (disabled in test env)
- ESLint + Prettier configuration
- Swagger UI on separate port (3003)
- OpenAPI 3.0 specification
- 30-second request timeout with AbortController
- Proper type guards instead of double casts
- URLSearchParams for URL building

## License

MIT
