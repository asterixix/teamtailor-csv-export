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
    components: {
      securitySchemes: {
        teamtailorApiKey: {
          type: 'apiKey',
          name: 'TEAMTAILOR_API_KEY',
          in: 'header',
          description: 'Teamtailor API key for authentication',
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Not Found',
                  },
                  message: {
                    type: 'string',
                    example: 'The requested resource was not found',
                  },
                },
              },
            },
          },
        },
        BadRequest: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: {
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
            },
          },
        },
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Unauthorized',
                  },
                  message: {
                    type: 'string',
                    example: 'Authentication required',
                  },
                },
              },
            },
          },
        },
        BadGateway: {
          description: 'Teamtailor API error',
          content: {
            'application/json': {
              schema: {
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
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Internal Server Error',
                  },
                  message: {
                    type: 'string',
                    example: 'An unexpected error occurred',
                  },
                },
              },
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
  },
  apis: ['./src/routes/*.js'],
};

/**
 * Generate OpenAPI specification
 */
export const swaggerSpec = swaggerJsdoc(options);
