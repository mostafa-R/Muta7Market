const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Muta7Market Sports Platform API",
    version: "1.0.0",
    description:
      "Professional Sports Player & Coach Marketing Platform API - Complete documentation for all endpoints",
    contact: {
      name: "API Support",
      email: "support@muta7market.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/api/v1",
      description: "Development server",
    },
    {
      url: "https://api.muta7market.com/v1",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token-based authentication",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
              code: {
                type: "string",
              },
              details: {
                type: "object",
              },
            },
          },
        },
      },
      Success: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          data: {
            type: "object",
          },
          message: {
            type: "string",
          },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              totalPages: { type: "integer" },
              totalItems: { type: "integer" },
            },
          },
        },
      },

      // User Schemas
      User: {
        type: "object",
        properties: {
          _id: { type: "string", format: "objectId" },
          name: { type: "string", minLength: 2, maxLength: 50 },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          role: {
            type: "string",
            enum: ["user", "admin", "super_admin", "coach"],
          },
          profileImage: {
            type: "object",
            properties: {
              url: { type: "string" },
              public_id: { type: "string" },
            },
          },
          isEmailVerified: { type: "boolean" },
          isPhoneVerified: { type: "boolean" },
          isActive: { type: "boolean" },
          bio: { type: "string" },
          lastLogin: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      // Authentication Schemas
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "phone", "password", "confirmPassword"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 50,
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          phone: {
            type: "string",
            pattern: "^(\\+?\\d{1,3}[- ]?)?\\d{7,14}$",
            example: "+966501234567",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "Password123!",
          },
          confirmPassword: {
            type: "string",
            example: "Password123!",
          },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            example: "Password123!",
          },
        },
      },

      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/User" },
              accessToken: { type: "string" },
              refreshToken: { type: "string" },
            },
          },
          message: { type: "string", example: "Authentication successful" },
        },
      },
    },
  },
  paths: {
    // ================================
    // AUTHENTICATION ENDPOINTS
    // ================================
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description:
          "Register a new user account with email and phone verification",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            user: { $ref: "#/components/schemas/User" },
                            message: {
                              type: "string",
                              example: "Please verify your email and phone",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Validation error or user already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        description: "Authenticate user with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout user",
        description: "Logout user and invalidate refresh token",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request password reset",
        description: "Send password reset OTP to user email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset OTP sent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Reset password",
        description: "Reset user password using OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["otp", "password", "confirmPassword"],
                properties: {
                  otp: { type: "string", example: "123456" },
                  password: {
                    type: "string",
                    minLength: 8,
                    example: "NewPassword123!",
                  },
                  confirmPassword: {
                    type: "string",
                    example: "NewPassword123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password reset successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Invalid or expired OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/verify-email": {
      post: {
        tags: ["Authentication"],
        summary: "Verify email address",
        description: "Verify user email with OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["otp"],
                properties: {
                  otp: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email verified successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Invalid or expired OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/verify-phone": {
      post: {
        tags: ["Authentication"],
        summary: "Verify phone number",
        description: "Verify user phone number with OTP",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["otp"],
                properties: {
                  otp: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Phone verified successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Invalid or expired OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/change-password": {
      post: {
        tags: ["Authentication"],
        summary: "Change password",
        description: "Change user password (requires current password)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword", "confirmPassword"],
                properties: {
                  currentPassword: {
                    type: "string",
                    example: "CurrentPassword123!",
                  },
                  newPassword: {
                    type: "string",
                    minLength: 8,
                    example: "NewPassword123!",
                  },
                  confirmPassword: {
                    type: "string",
                    example: "NewPassword123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password changed successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Invalid current password or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/auth/profile": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user profile",
        description: "Get authenticated user profile information",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            user: { $ref: "#/components/schemas/User" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // ================================
    // USER MANAGEMENT ENDPOINTS
    // ================================
    "/user/update": {
      patch: {
        tags: ["User Management"],
        summary: "Update user profile",
        description: "Update authenticated user profile information",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 50 },
                  phone: { type: "string" },
                  bio: { type: "string", maxLength: 200 },
                  profileImage: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            user: { $ref: "#/components/schemas/User" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/user/notpaid": {
      get: {
        tags: ["User Management"],
        summary: "Get unpaid user items",
        description: "Get list of unpaid items for authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Unpaid items retrieved successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // ================================
    // PLAYER ENDPOINTS
    // ================================
    "/players": {
      get: {
        tags: ["Players"],
        summary: "Get all players",
        description: "Get list of all players with filtering and pagination",
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: "search",
            in: "query",
            description: "Search term for name or position",
            schema: { type: "string" },
          },
          {
            name: "nationality",
            in: "query",
            description: "Filter by nationality",
            schema: { type: "string" },
          },
          {
            name: "game",
            in: "query",
            description: "Filter by game/sport",
            schema: { type: "string" },
          },
          {
            name: "gender",
            in: "query",
            description: "Filter by gender",
            schema: { type: "string", enum: ["male", "female"] },
          },
          {
            name: "status",
            in: "query",
            description: "Filter by status",
            schema: {
              type: "string",
              enum: ["available", "busy", "transferred", "retired"],
            },
          },
          {
            name: "isPromoted",
            in: "query",
            description: "Filter by promotion status",
            schema: { type: "boolean" },
          },
        ],
        responses: {
          200: {
            description: "Players retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            players: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Player" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    "/players/{id}": {
      get: {
        tags: ["Players"],
        summary: "Get player by ID",
        description: "Get detailed information about a specific player",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Player ID",
            schema: { type: "string", format: "objectId" },
          },
        ],
        responses: {
          200: {
            description: "Player retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            player: { $ref: "#/components/schemas/Player" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: {
            description: "Player not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Players"],
        summary: "Update player profile",
        description:
          "Update player profile (requires authentication and verification)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Player ID",
            schema: { type: "string", format: "objectId" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  age: { type: "integer", minimum: 15, maximum: 50 },
                  gender: { type: "string", enum: ["male", "female"] },
                  nationality: { type: "string" },
                  position: { type: "string" },
                  status: {
                    type: "string",
                    enum: ["available", "busy", "transferred", "retired"],
                  },
                  expreiance: { type: "integer", minimum: 0 },
                  game: { type: "string" },
                  profileImage: { type: "string", format: "binary" },
                  document: { type: "string", format: "binary" },
                  playerVideo: { type: "string", format: "binary" },
                  monthlySalary: { type: "string" },
                  yearSalary: { type: "string" },
                  socialLinks: { type: "string" },
                  contactInfo: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Player updated successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            player: { $ref: "#/components/schemas/Player" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not verified or not owner",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Player not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/players/createPlayer": {
      post: {
        tags: ["Players"],
        summary: "Create new player profile",
        description:
          "Create a new player profile (requires authentication and verification)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/CreatePlayerRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Player created successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            player: { $ref: "#/components/schemas/Player" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/players/playerprofile": {
      get: {
        tags: ["Players"],
        summary: "Get current user player profile",
        description: "Get authenticated users own player profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Player profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            player: { $ref: "#/components/schemas/Player" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - not verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Player profile not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    // ================================
    // OFFER ENDPOINTS
    // ================================
    "/offers": {
      get: {
        tags: ["Offers"],
        summary: "Get all offers",
        description: "Get list of all offers with filtering and pagination",
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: "category",
            in: "query",
            description: "Filter by category",
            schema: {
              type: "string",
              enum: [
                "player_wanted",
                "coach_wanted",
                "player_available",
                "coach_available",
                "other",
              ],
            },
          },
          {
            name: "search",
            in: "query",
            description: "Search in title and description",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Offers retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            offers: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Offer" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Offers"],
        summary: "Create new offer",
        description:
          "Create a new job/opportunity offer (requires authentication)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "description", "category"],
                properties: {
                  title: {
                    type: "object",
                    properties: {
                      en: { type: "string" },
                      ar: { type: "string" },
                    },
                  },
                  description: {
                    type: "object",
                    properties: {
                      en: { type: "string" },
                      ar: { type: "string" },
                    },
                  },
                  category: {
                    type: "string",
                    enum: [
                      "player_wanted",
                      "coach_wanted",
                      "player_available",
                      "coach_available",
                      "other",
                    ],
                  },
                  targetProfile: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["player", "coach"] },
                      positions: { type: "array", items: { type: "string" } },
                      nationality: { type: "string" },
                      ageRange: {
                        type: "object",
                        properties: {
                          min: { type: "integer" },
                          max: { type: "integer" },
                        },
                      },
                    },
                  },
                  offerDetails: {
                    type: "object",
                    properties: {
                      club: { type: "string" },
                      location: { type: "string" },
                      contractDuration: { type: "integer" },
                      benefits: { type: "array", items: { type: "string" } },
                      requirements: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Offer created successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            offer: { $ref: "#/components/schemas/Offer" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/offers/{id}": {
      get: {
        tags: ["Offers"],
        summary: "Get offer by ID",
        description: "Get detailed information about a specific offer",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Offer ID",
            schema: { type: "string", format: "objectId" },
          },
        ],
        responses: {
          200: {
            description: "Offer retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            offer: { $ref: "#/components/schemas/Offer" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: {
            description: "Offer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Offers"],
        summary: "Update offer",
        description: "Update offer information (requires authentication)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Offer ID",
            schema: { type: "string", format: "objectId" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "object",
                    properties: {
                      en: { type: "string" },
                      ar: { type: "string" },
                    },
                  },
                  description: {
                    type: "object",
                    properties: {
                      en: { type: "string" },
                      ar: { type: "string" },
                    },
                  },
                  status: {
                    type: "string",
                    enum: ["active", "inactive", "expired", "completed"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Offer updated successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            offer: { $ref: "#/components/schemas/Offer" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Offer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Offers"],
        summary: "Delete offer",
        description: "Delete offer (requires authentication)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Offer ID",
            schema: { type: "string", format: "objectId" },
          },
        ],
        responses: {
          200: {
            description: "Offer deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Offer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/offers/featured": {
      get: {
        tags: ["Offers"],
        summary: "Get featured offers",
        description: "Get list of featured/promoted offers",
        responses: {
          200: {
            description: "Featured offers retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            offers: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Offer" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    "/offers/search": {
      get: {
        tags: ["Offers"],
        summary: "Search offers",
        description: "Search offers with advanced filters",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Search query",
            schema: { type: "string" },
          },
          {
            name: "category",
            in: "query",
            description: "Filter by category",
            schema: {
              type: "string",
              enum: [
                "player_wanted",
                "coach_wanted",
                "player_available",
                "coach_available",
                "other",
              ],
            },
          },
          {
            name: "location",
            in: "query",
            description: "Filter by location",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Search results retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            offers: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Offer" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    // ================================
    // PAYMENT ENDPOINTS
    // ================================
    "/payments/initiate": {
      post: {
        tags: ["Payments"],
        summary: "Initiate payment",
        description:
          "Initiate a new payment transaction (requires authentication)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InitiatePaymentRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Payment initiated successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            payment: { $ref: "#/components/schemas/Payment" },
                            checkoutUrl: { type: "string", format: "uri" },
                            transactionId: { type: "string" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment details",
        description:
          "Get detailed information about a payment (requires authentication)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Payment ID",
            schema: { type: "string", format: "objectId" },
          },
        ],
        responses: {
          200: {
            description: "Payment details retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            payment: { $ref: "#/components/schemas/Payment" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Payment not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/payments/{id}/status": {
      get: {
        tags: ["Payments"],
        summary: "Get payment status",
        description:
          "Get current status of a payment (requires authentication)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Payment ID",
            schema: { type: "string", format: "objectId" },
          },
        ],
        responses: {
          200: {
            description: "Payment status retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            status: {
                              type: "string",
                              enum: [
                                "pending",
                                "completed",
                                "failed",
                                "cancelled",
                                "refunded",
                              ],
                            },
                            paymentId: { type: "string" },
                            amount: { type: "number" },
                            currency: { type: "string" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Payment not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/payments/webhook": {
      post: {
        tags: ["Payments"],
        summary: "Payment webhook",
        description:
          "Webhook endpoint for payment gateway notifications (no authentication required)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  transactionId: { type: "string" },
                  status: { type: "string" },
                  amount: { type: "number" },
                  currency: { type: "string" },
                  referenceNumber: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Webhook processed successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          400: {
            description: "Invalid webhook data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },

    "/payments/orders": {
      post: {
        tags: ["Payments"],
        summary: "Get all payment orders",
        description: "Get list of all payment orders",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  page: { type: "integer", minimum: 1, default: 1 },
                  limit: {
                    type: "integer",
                    minimum: 1,
                    maximum: 100,
                    default: 10,
                  },
                  status: {
                    type: "string",
                    enum: [
                      "pending",
                      "completed",
                      "failed",
                      "cancelled",
                      "refunded",
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Payment orders retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/Success" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            payments: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Payment" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerDocument;
