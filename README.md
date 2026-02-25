# Teamtailor CSV Export

## AI Disclaimer
In building process used Claude Sonnet 4.5 to plan base API configuration and implementation (also for iterate analysis to research gaps, missings and issues), KAT Coder Pro V1 in code development, testing and preparation to publish, GLM 5 for quick fixes and simple commits and MCP Servers like Context7, Perplexity Ask, Z.AI tools, GitHub, WebSearch, Fetch, Morph etc. to support in checking documentations, search information, analyze approaches, quick edits. All models runned in OpenCode configured with OhMyOpenCode and self configured agents for Planning, Coding and Debugging.
Maybe in future will use Vibe Kanban for better AI agentic workflows and commit history, but not yet implemented in daily stack :(

## Features

- **Stream-based CSV export**: Efficiently handles large datasets without buffering in memory
- **Teamtailor API integration**: Seamless authentication and pagination support
- **Type-safe**: Full TypeScript support with strict mode enabled
- **Error handling**: Comprehensive error handling with meaningful HTTP status codes
- **RESTful API**: Clean, simple endpoint for CSV export
- **Tested**: Comprehensive test suite with Vitest and Supertest
- **Logging**: Winston logger with Morgan request logging for debugging
- **Code Quality**: ESLint with TypeScript rules and Prettier formatting
- **API Documentation**: Swagger UI with OpenAPI 3.0 specification

## Prerequisites

- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher (included with Node.js)
- **Teamtailor API Key**: From your Teamtailor account (required for data access)
- **Cats or Dogs**: They are so much important mental support in backend coding.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd teamtailor-csv-export
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Teamtailor API key:
```
TEAMTAILOR_API_KEY=your_actual_api_key_here
```

## Configuration

Configure the application using environment variables in your `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port number |
| `SWAGGER_PORT` | `3003` | Swagger UI port number |
| `TEAMTAILOR_API_KEY` | Required | Your Teamtailor API authentication key |
| `TEAMTAILOR_BASE_URL` | `https://api.teamtailor.com` | Teamtailor API base URL |
| `TEAMTAILOR_API_VERSION` | `v1` | Teamtailor API version |
| `TEAMTAILOR_PAGE_SIZE` | `100` | Number of records per API request (pagination) |
| `TEAMTAILOR_API_VERSION` | `20240904` | Teamtailor API version (updated for compatibility) |

## Running the Application

### Development Mode
Watch mode with automatic restart on file changes:
```bash
npm run dev
```

The server starts on `http://localhost:3000` (default) or your configured `PORT`.

### Development with Logging and Swagger UI
Start with Winston and Morgan logging for debugging, plus Swagger UI for API documentation:
```bash
npm run dev:both
```

This starts both servers:
- **API Server**: http://localhost:3002 (or your configured `PORT`)
- **Swagger UI**: http://localhost:3003/api-docs

You'll see:
- Winston info logs for server startup
- Morgan request logs for each HTTP request
- Winston error logs for any issues

### Swagger UI Documentation
Access interactive API documentation at:
- **Swagger UI**: http://localhost:3003/api-docs
- **OpenAPI Spec**: http://localhost:3002/api-docs.json

### Production Mode
Build and start:
```bash
npm run build
npm start
```

### Health Check
Verify the server is running:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## API Endpoints

### Export Candidates as CSV
**GET** `/api/export/candidates`

Downloads all candidates from your Teamtailor account as a CSV file.

**Query Parameters**: None

**Response**:
- **Status**: 200 OK
- **Headers**:
  - `Content-Type`: `text/csv`
  - `Content-Disposition`: `attachment; filename="candidates-YYYY-MM-DD.csv"`
  - `Transfer-Encoding`: `chunked` (streaming)

**CSV Columns**:
- `candidate_id`: Unique candidate identifier
- `first_name`: Candidate's first name
- `last_name`: Candidate's last name
- `email`: Candidate's email address
- `job_application_id`: Associated job application ID
- `job_application_created_at`: Application creation timestamp (ISO 8601)

**Example Usage**:
```bash
# Download and save to file
curl -o candidates.csv http://localhost:3000/api/export/candidates

# Download and view
curl http://localhost:3000/api/export/candidates | head -20
```

**Error Responses**:

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid Teamtailor API key
- **502 Bad Gateway**: Teamtailor API error
- **500 Internal Server Error**: Unexpected server error

### Health Check
**GET** `/health`

Returns server health status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## Development

### Run Tests
Execute the full test suite:
```bash
npm test
```

Watch mode for continuous testing:
```bash
npm run test:watch
```

### Lint Code
Check code quality:
```bash
npm run lint
```

### Format Code
Apply Prettier formatting:
```bash
npm run format
```

### Run Both Servers
Start both API and Swagger UI servers:
```bash
npm run dev:both
```

### Production with Both Servers
Build and start both:
```bash
npm run build
npm start:both
```

### Build TypeScript
Compile to JavaScript:
```bash
npm run build
```

Output goes to the `dist/` directory.

### Code Quality Checks
Run all quality checks:
```bash
npm run lint
npm run format:check
npm run build
npm test
```

### Swagger UI Server
Run only the Swagger UI documentation server:
```bash
npm run dev:swagger  # Development
npm start:swagger    # Production
```

The Swagger UI server runs on port 3003 by default and provides:
- Interactive API documentation
- Test endpoints directly in the browser
- OpenAPI specification validation

## Project Structure

```
teamtailor-csv-export/
├── src/
│   ├── config.ts              # Environment configuration
│   ├── index.ts               # Application entry point
│   ├── server.ts              # Express app setup with logging
│   ├── swagger-server.ts      # Swagger UI server on separate port
│   ├── shared/
│   │   └── logger.ts            # Winston logger configuration
│   ├── routes/
│   │   ├── export.ts          # CSV export endpoints
│   │   └── export.test.ts     # Export route tests
│   ├── docs/
│   │   └── swagger.js         # OpenAPI 3.0 specification
│   └── services/
│       ├── csv/
│       │   └── generator.ts   # CSV streaming logic
│       └── teamtailor/
│           ├── client.ts      # API client and fetch utilities
│           ├── candidates.ts  # Candidate data streaming
│           └── types.ts       # TypeScript type definitions
├── public/
│   └── index.html             # Landing page
├── dist/                      # Compiled JavaScript (generated)
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── eslint.config.mjs          # ESLint configuration
├── .prettierrc                # Prettier formatting rules
├── .prettierignore            # Prettier ignore rules
├── package.json               # Project metadata and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## How It Works

1. **Client Request**: User requests `/api/export/candidates`
2. **CSV Generation**: Express handler initiates CSV export
3. **Data Streaming**: Candidates are fetched from Teamtailor API in paginated batches
4. **CSV Formatting**: Each row is converted to CSV format and streamed to the response
5. **Download**: Browser receives the file as an attachment with automatic filename

The streaming approach means:
- Memory usage is constant regardless of candidate count
- First bytes start sending immediately
- Large exports complete without timeouts
- Failed requests are handled gracefully

## API Documentation with Swagger UI

The application includes comprehensive API documentation using Swagger UI:

### Swagger UI Server
- **Separate Port**: Runs on port 3003 (configurable via `SWAGGER_PORT`)
- **Interactive Documentation**: Browse and test API endpoints in your browser
- **OpenAPI 3.0**: Full specification with request/response schemas
- **Authentication**: Documents required API key authentication

### Documented Endpoints
- **GET /health**: Health check endpoint
- **GET /api/export/candidates**: CSV export endpoint
- **Error Responses**: All error scenarios documented with examples

### Running with Swagger UI
```bash
# Start both API and Swagger UI servers
npm run dev:both

# Start only Swagger UI server
npm run dev:swagger
```

## Logging

## Logging

The application includes comprehensive logging for development and debugging:

### Winston Logger
- **Universal logging**: Use throughout the application for consistent logging
- **Colorized output**: Easy-to-read colored logs in development
- **Error handling**: Automatic stack trace logging for errors
- **Log levels**: Info, error, warn levels supported

Usage:
```typescript
import logger from './shared/logger.js';

logger.info('Server started');
logger.error('API error occurred', error);
logger.warn('Warning message');
```

### Morgan Request Logger
- **HTTP request logging**: Automatic logging of all incoming requests
- **Development format**: Shows method, URL, status, and response time
- **Real-time feedback**: Immediate visibility into API usage

Example output:
```
GET /health 200 2.123 ms - 67
GET /api/export/candidates 200 - - ms - -
```

## Error Handling

- **API Errors**: Teamtailor API failures return 502 with error details
- **Stream Errors**: Stream failures are caught and return 500
- **Config Errors**: Missing environment variables fail at startup
- **Validation**: TypeScript strict mode catches type errors at build time

## Code Quality

### ESLint Configuration
- **TypeScript rules**: Comprehensive TypeScript-specific linting rules
- **Node.js globals**: Proper environment configuration
- **Unused variables**: Automatic detection and removal
- **Strict mode**: Enforces best practices

### Prettier Formatting
- **Consistent style**: Automatic code formatting
- **TypeScript support**: Proper handling of TypeScript syntax
- **Configurable rules**: Customizable formatting options

## Security

- **API Key Protection**: Store your API key in `.env` (never in version control)
- **HTTPS**: Deploy with HTTPS in production
- **CORS**: Static file serving only (no cross-origin API calls)
- **Headers**: Proper Content-Type and Content-Disposition headers
- **Validation**: Input validation via TypeScript types

## Performance

- **Streaming**: No data buffering - constant memory usage
- **Pagination**: API requests limited to `TEAMTAILOR_PAGE_SIZE` (default 100)
- **Compression**: HTTP chunked transfer encoding for efficient delivery
- **Async I/O**: All I/O operations are non-blocking

## Troubleshooting

### "Body is unusable: Body has already been read"
**Solution**: This was a bug in the Teamtailor API client. Fixed by reading response body once and handling JSON parsing properly.

### "net::ERR_EMPTY_RESPONSE" in browser
**Solution**: This was caused by incorrect Teamtailor API configuration. Fixed by:
- Using correct base URL: `https://api.teamtailor.com/v1`
- Using correct API version: `20240904`
- Setting appropriate page size: `30` (Teamtailor limit)

### "Missing required environment variable: TEAMTAILOR_API_KEY"
**Solution**: Copy `.env.example` to `.env` and add your actual API key:
```bash
cp .env.example .env
# Edit .env with your API key
```
**Solution**: Copy `.env.example` to `.env` and add your actual API key:
```bash
cp .env.example .env
# Edit .env with your API key
```

### "Teamtailor API request failed: 401 Unauthorized"
**Solution**: Verify your `TEAMTAILOR_API_KEY` is correct and active in your Teamtailor account.

### "Connection timeout"
**Solution**: Check your internet connection and ensure `TEAMTAILOR_BASE_URL` is correct.

### CSV file is empty
**Solution**: Verify you have candidates in your Teamtailor account with valid job applications.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Commit with descriptive message
6. Push and create a pull request

## License

MIT

## Support

For issues with:
- **Application**: Create an issue on the GitHub repository
- **Teamtailor API**: Check [Teamtailor API documentation](https://www.teamtailor.com/)
- **Node.js**: See [Node.js documentation](https://nodejs.org/docs/)

## Changelog

### Version 1.0.0
- Initial release
- Candidate CSV export with streaming
- Health check endpoint
- Comprehensive test suite
- TypeScript support
- Winston logging with Morgan request logging
- ESLint with TypeScript rules
- Prettier code formatting
- Fixed Teamtailor API configuration issues
- Fixed "Body is unusable" error in API client
- Fixed "net::ERR_EMPTY_RESPONSE" browser error
- **Swagger UI Integration**: Interactive API documentation with OpenAPI 3.0
- **Separate Documentation Server**: Swagger UI runs on port 3003
- **Auto-generated Documentation**: JSDoc comments generate API docs
- **OpenAPI Specification**: Complete API spec at `/api-docs.json`
