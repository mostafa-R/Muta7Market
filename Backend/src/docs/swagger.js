const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sports Platform API',
    version: '1.0.0',
    description: 'Professional Sports Player & Coach Marketing Platform API',
    contact: {
      name: 'API Support',
      email: 'support@sportsplatform.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development server'
    },
    {
      url: 'https://api.sportsplatform.com/v1',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string'
              }
            }
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object'
          },
          message: {
            type: 'string'
          }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'password'],
                properties: {
                  name: {
                    type: 'string',
                    example: 'John Doe'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com'
                  },
                  phone: {
                    type: 'string',
                    example: '+966501234567'
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'Password123!'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Success'
                }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  }
};

export default swaggerDocument;
