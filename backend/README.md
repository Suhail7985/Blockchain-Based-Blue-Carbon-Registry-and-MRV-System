# Backend API - CarbonSetu

## 📁 Folder Structure

```
backend/
├── config/           # Configuration files
│   └── database.js   # MongoDB connection
├── controllers/      # Business logic
│   ├── authController.js
│   ├── healthController.js
│   └── plantationController.js
├── middleware/       # Middleware functions
│   ├── errorHandler.js
│   ├── logger.js
│   └── notFound.js
├── models/          # Mongoose schemas
│   └── Plantation.js
├── routes/          # Route definitions
│   ├── authRoutes.js
│   ├── healthRoutes.js
│   └── plantationRoutes.js
├── utils/           # Utility functions
│   └── constants.js
└── server.js        # Application entry point
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blue-carbon-registry
```

### Run Server

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /api/health` - Health check

### Authentication (Mock)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Plantations
- `GET /api/plantations` - Get all plantations
- `GET /api/plantations/:id` - Get single plantation
- `POST /api/plantations` - Create new plantation
- `PATCH /api/plantations/:id` - Update plantation
- `DELETE /api/plantations/:id` - Delete plantation

## 📝 Code Organization

### Models
- **Plantation.js**: Mongoose schema for plantation data

### Controllers
- **plantationController.js**: Business logic for plantation operations
- **authController.js**: Authentication logic (currently mock)
- **healthController.js**: Health check endpoints

### Routes
- **plantationRoutes.js**: Plantation API routes
- **authRoutes.js**: Authentication routes
- **healthRoutes.js**: Health check routes

### Middleware
- **errorHandler.js**: Global error handling
- **notFound.js**: 404 handler
- **logger.js**: Request logging

### Config
- **database.js**: MongoDB connection configuration

### Utils
- **constants.js**: Application constants (carbon rate, statuses, roles)

## 🔧 Development

### Adding New Routes

1. Create controller in `controllers/` folder
2. Create route file in `routes/` folder
3. Import and use in `server.js`

### Adding New Models

1. Create model file in `models/` folder
2. Export Mongoose model
3. Import in controllers as needed

### Adding Middleware

1. Create middleware file in `middleware/` folder
2. Export middleware function
3. Use in `server.js` or specific routes

## 🛠️ Future Improvements

- [ ] Add real JWT authentication
- [ ] Add user model and database schema
- [ ] Add password hashing (bcrypt)
- [ ] Add protected routes middleware
- [ ] Add validation middleware
- [ ] Add rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Add unit tests
- [ ] Add integration tests

## 📚 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: CORS middleware
- **dotenv**: Environment variables

## 🐛 Error Handling

Errors are handled by the global error handler middleware. All errors are logged and returned in a consistent format.

## 📊 Database

MongoDB is used as the database. Connection is handled in `config/database.js`.

## 🔐 Security Notes

⚠️ **Current authentication is mock only**. For production, implement:
- Real JWT authentication
- Password hashing (bcrypt)
- Protected routes
- Input validation
- Rate limiting
- CORS configuration


