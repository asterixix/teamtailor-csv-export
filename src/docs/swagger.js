import swaggerJsdoc from 'swagger-jsdoc';

/**
 * OpenAPI specification configuration
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Teamtailor CSV Export API',
      version: '1.0.0',
      description: 'API for exporting candidate data from Teamtailor as CSV files',
      contact: {
        name: 'Teamtailor CSV Export',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3003',
        description: 'Swagger UI server',
      },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check endpoint',
          description: 'Returns the server health status',
          operationId: 'getHealth',
          responses: {
            200: {
              description: 'Success response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'ok',
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-15T10:30:45.123Z',
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api-docs.json': {
        get: {
          tags: ['Documentation'],
          summary: 'OpenAPI specification',
          description: 'Returns the OpenAPI 3.0 specification for this API',
          operationId: 'getOpenApiSpec',
          responses: {
            200: {
              description: 'OpenAPI specification',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
      },
      '/api/export/candidates': {
        get: {
          tags: ['Export'],
          summary: 'Export candidates as CSV',
          description:
            'Downloads all candidates from your Teamtailor account as a CSV file. Includes candidate information and job application details.',
          operationId: 'exportCandidatesCsv',
          responses: {
            200: {
              description: 'CSV file download',
              content: {
                'text/csv': {
                  schema: {
                    type: 'string',
                  },
                  example:
                    'candidate_id,first_name,last_name,email,job_application_id,job_application_created_at\n25235329,Lill,Friman,lill@example.com,29305118,2022-03-22T15:59:12.658+01:00',
                },
              },
              headers: {
                'Content-Disposition': {
                  description: 'Attachment filename',
                  schema: {
                    type: 'string',
                    example: 'attachment; filename="candidates-2024-01-15.csv"',
                  },
                },
              },
            },
            400: {
              description: 'Invalid request parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            401: {
              description: 'Authentication required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            502: {
              description: 'Teamtailor API error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorWithStatus',
                  },
                },
              },
            },
            500: {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        teamtailorApiKey: {
          type: 'apiKey',
          name: 'TEAMTAILOR_API_KEY',
          in: 'header',
          description: 'Teamtailor API key for authentication (configured server-side)',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Bad Request',
            },
            message: {
              type: 'string',
              example: 'Invalid request parameters',
            },
          },
        },
        ErrorWithStatus: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Bad Gateway',
            },
            message: {
              type: 'string',
              example: 'Teamtailor API request failed',
            },
            status: {
              type: 'number',
              example: 404,
            },
          },
        },
      },
    },
    security: [
      {
        teamtailorApiKey: [],
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check operations',
      },
      {
        name: 'Documentation',
        description: 'API documentation endpoints',
      },
      {
        name: 'Export',
        description: 'CSV export operations',
      },
    ],
  },
  apis: [],
};

/**
 * Generate OpenAPI specification
 */
export const swaggerSpec = swaggerJsdoc(options);
