# Backend Folder Structure

## 📁 Complete Folder Structure

```
backend/
│
├── config/                    # Configuration files
│   └── database.js           # MongoDB connection setup
│
├── controllers/              # Business logic layer
│   ├── authController.js     # Authentication logic (login, register, getMe)
│   ├── healthController.js   # Health check endpoints
│   └── plantationController.js # Plantation CRUD operations
│
├── middleware/               # Middleware functions
│   ├── errorHandler.js       # Global error handler
│   ├── logger.js             # Request logger
│   └── notFound.js           # 404 handler
│
├── models/                   # Database models (Mongoose schemas)
│   └── Plantation.js         # Plantation schema and model
│
├── routes/                   # Route definitions
│   ├── authRoutes.js         # Authentication routes
│   ├── healthRoutes.js       # Health check routes
│   └── plantationRoutes.js   # Plantation API routes
│
├── utils/                    # Utility functions and constants
│   └── constants.js          # Application constants
│
├── server.js                 # Application entry point
├── package.json              # Dependencies
└── README.md                 # Documentation
```

## 🔄 Request Flow

```
Client Request
    ↓
server.js (Entry Point)
    ↓
Middleware (CORS, JSON Parser, Logger)
    ↓
Routes (Route Definition)
    ↓
Controllers (Business Logic)
    ↓
Models (Database Operations)
    ↓
Response to Client
```

## 📝 File Responsibilities

### server.js
- Application entry point
- Server setup and configuration
- Middleware registration
- Route registration
- Error handling setup
- Server startup

### config/database.js
- MongoDB connection
- Connection error handling
- Database configuration

### models/Plantation.js
- Mongoose schema definition
- Data validation rules
- Model export

### controllers/
- **plantationController.js**: All plantation-related business logic
  - getAllPlantations
  - getPlantationById
  - createPlantation
  - updatePlantation
  - deletePlantation

- **authController.js**: Authentication logic
  - login
  - register
  - getMe

- **healthController.js**: Health check endpoints
  - healthCheck
  - getRoot

### routes/
- **plantationRoutes.js**: Plantation API routes
  - GET /api/plantations
  - GET /api/plantations/:id
  - POST /api/plantations
  - PATCH /api/plantations/:id
  - DELETE /api/plantations/:id

- **authRoutes.js**: Authentication routes
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me

- **healthRoutes.js**: Health check routes
  - GET /api/health

### middleware/
- **errorHandler.js**: Global error handling
- **logger.js**: Request logging
- **notFound.js**: 404 error handler

### utils/constants.js
- Application constants
- Carbon sequestration rate
- Status enums
- User roles

## 🎯 Benefits of This Structure

1. **Separation of Concerns**: Each folder has a specific purpose
2. **Maintainability**: Easy to find and modify code
3. **Scalability**: Easy to add new features
4. **Testability**: Easy to test individual components
5. **Readability**: Clear code organization
6. **Reusability**: Components can be reused

## 🚀 Adding New Features

### Adding a New Model
1. Create file in `models/` folder
2. Define Mongoose schema
3. Export model

### Adding a New Controller
1. Create file in `controllers/` folder
2. Import model
3. Write business logic functions
4. Export functions

### Adding New Routes
1. Create file in `routes/` folder
2. Import controller functions
3. Define routes
4. Export router
5. Import and use in `server.js`

### Adding New Middleware
1. Create file in `middleware/` folder
2. Write middleware function
3. Export function
4. Use in `server.js` or routes

## 📊 Code Organization Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **DRY (Don't Repeat Yourself)**: Reusable components
3. **Separation of Concerns**: Logic separated by layers
4. **Modularity**: Components are independent
5. **Consistency**: Consistent naming and structure

## 🔐 Security Considerations

- Authentication middleware should be added to `middleware/` folder
- Validation middleware should be added to `middleware/` folder
- Rate limiting middleware should be added to `middleware/` folder
- Input validation should be in controllers or separate validation files

## 🧪 Testing Structure (Future)

```
backend/
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── utils/
│   ├── integration/
│   │   ├── routes/
│   │   └── api/
│   └── fixtures/
```

## 📚 Documentation

- Each controller should have JSDoc comments
- Each route should have comments explaining its purpose
- Complex logic should be documented
- API endpoints should be documented (Swagger in future)


