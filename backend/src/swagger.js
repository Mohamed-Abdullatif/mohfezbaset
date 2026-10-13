const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'المحفظ البسيط — Muhfez Baset API',
      version: '1.0.0',
      description: 'REST API for the Mohafez Baseet Quran memorization platform',
    },
    servers: [{ url: 'http://localhost:5001', description: 'Local server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the token returned from /api/auth/login or /api/auth/register',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Mohamed Abdullatif' },
            email: { type: 'string', example: 'user@example.com' },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGci...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Bookmark: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            surah_number: { type: 'integer', example: 2 },
            ayah_number: { type: 'integer', example: 255 },
            note: { type: 'string', example: 'آية الكرسي' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Progress: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            surah_number: { type: 'integer', example: 1 },
            memorized_ayahs: { type: 'integer', example: 5 },
            total_ayahs: { type: 'integer', example: 7 },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Download: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            surah_number: { type: 'integer', example: 36 },
            reciter: { type: 'string', example: 'ar.alafasy' },
            downloaded_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth',      description: 'Register, login & profile management' },
      { name: 'Bookmarks', description: 'Ayah bookmarks (requires auth)' },
      { name: 'Progress',  description: 'Memorization progress (requires auth)' },
      { name: 'Downloads', description: 'Downloaded surahs (requires auth)' },
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['Auth'],
          summary: 'Health check',
          responses: { 200: { description: 'API is up', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, app: { type: 'string' } } } } } } },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Mohamed' },
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'secret123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Missing fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'secret123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/google': {
        post: {
          tags: ['Auth'],
          summary: 'Login or register with Google OAuth',
          description: 'Exchange a Google access_token (from the frontend OAuth flow) for a JWT.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['access_token'],
                  properties: {
                    access_token: { type: 'string', example: 'ya29.a0AfH6SM...' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Missing access token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Invalid Google token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/profile': {
        put: {
          tags: ['Auth'],
          summary: 'Update profile name and/or password',
          description: 'Authenticated users can update their display name. Password change requires the current password.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name:            { type: 'string',  example: 'محمد عبد اللطيف', description: 'New display name' },
                    currentPassword: { type: 'string',  example: 'old_secret',      description: 'Required only when changing password' },
                    newPassword:     { type: 'string',  example: 'new_secret',      description: 'Min 6 characters. Omit to keep current password.' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Profile updated — returns fresh token + updated user',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
            },
            400: { description: 'Password too short', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Invalid or missing token / wrong current password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/bookmarks': {
        get: {
          tags: ['Bookmarks'],
          summary: 'Get all bookmarks for the logged-in user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of bookmarks', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Bookmark' } } } } },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Bookmarks'],
          summary: 'Add a bookmark',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['surah_number', 'ayah_number'],
                  properties: {
                    surah_number: { type: 'integer', example: 2 },
                    ayah_number: { type: 'integer', example: 255 },
                    note: { type: 'string', example: 'آية الكرسي' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Bookmark created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Bookmark' } } } },
            401: { description: 'Unauthorized' },
            409: { description: 'Already bookmarked' },
          },
        },
      },
      '/api/bookmarks/{id}': {
        delete: {
          tags: ['Bookmarks'],
          summary: 'Delete a bookmark by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Deleted successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/progress': {
        get: {
          tags: ['Progress'],
          summary: 'Get memorization progress for all surahs',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Progress list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Progress' } } } } },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Progress'],
          summary: 'Save or update progress for a surah',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['surah_number', 'memorized_ayahs', 'total_ayahs'],
                  properties: {
                    surah_number: { type: 'integer', example: 1 },
                    memorized_ayahs: { type: 'integer', example: 5 },
                    total_ayahs: { type: 'integer', example: 7 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Progress saved' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/downloads': {
        get: {
          tags: ['Downloads'],
          summary: 'Get all downloaded surahs for the user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Downloads list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Download' } } } } },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Downloads'],
          summary: 'Mark a surah as downloaded',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['surah_number', 'reciter'],
                  properties: {
                    surah_number: { type: 'integer', example: 36 },
                    reciter: { type: 'string', example: 'ar.alafasy', enum: ['ar.alafasy','ar.sudais','ar.shuraym','ar.mahermuaiqly','ar.minshawi','ar.husary','ar.abdulbasitmurattal','ar.abdulsamad','ar.hudhaify','ar.saadalghamdi','ar.yasseraldossari','ar.nasseralqatami','ar.shaatree','ar.abdullahbasfar','ar.muhammadayyoub','ar.muhammadjibreel','ar.ahmedajamy','ar.faresabbad','ar.idreesabkr','ar.raadalkurdi','ar.tablawi','ar.mustafaismail','ar.mahmoudali','ar.khalilhusary','ar.akhdar','ar.husarymujawwad','ar.minshawimujawwad','ar.abdulbasitmujawwad','ar.hanirifai','ar.muhsinalqasim','ar.abdullahawadaljuhani','ar.sahlyaaseen','ar.ahmedneana','ar.yaseen','ar.khaleefaaltunaiji','ar.parhizgar','ar.alafasy64kbps','ar.mahermuaiqly64kbps'] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Download recorded' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/downloads/{surah}/{reciter}': {
        delete: {
          tags: ['Downloads'],
          summary: 'Remove a downloaded surah',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'surah', in: 'path', required: true, schema: { type: 'integer' }, example: 36 },
            { name: 'reciter', in: 'path', required: true, schema: { type: 'string' }, example: 'ar.alafasy' },
          ],
          responses: {
            200: { description: 'Removed successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
