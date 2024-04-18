### Project Structure

Here's a brief overview of the top-level directories of this project:

```plaintext
Rest API/
├── node_modules/                   # Node.js modules installed for the project
├── public/                         # Public static assets accessible by the client
│   └── data/
│       └── uploads/                # Directory for temporary file uploads
├── src/                            # Source code for the application
│   ├── book/                       # 'Book' resource module
│   │   ├── bookController.ts       # Controller for book-related HTTP requests
│   │   ├── bookModel.ts            # Data model for the book resource
│   │   ├── bookRouter.ts           # Routing for book-related HTTP endpoints
│   │   └── bookTypes.ts            # TypeScript definitions for the book module
│   ├── user/                       # 'User' resource module
│   │   ├── userController.ts       # Controller for user-related HTTP requests
│   │   ├── userModel.ts            # Data model for the user resource
│   │   ├── userRouter.ts           # Routing for user-related HTTP endpoints
│   │   └── userTypes.ts            # TypeScript definitions for the user module
│   ├── middlewares/                # Middleware for various HTTP request handling
│   │   ├── authenticate.ts         # Middleware for user authentication
│   │   └── globalErrorHandler.ts   # Middleware for handling global errors
│   ├── utils/                      # Utility functions used across the application
│   │   ├── uploadAndCleanup.ts     # Functions for Cloudinary operations
│   │   └── [other utility files]   # Other shared utility functions
│   └── config/                     # Application configuration settings
│       ├── index.ts                # Centralized export of config settings
│       ├── cloudinary.ts           # Cloudinary specific configurations
│       └── db.ts                   # Database connection settings
├── .env                            # Environment variables for development
├── app.ts                          # Express app setup with middleware and routes
├── package.json                    # Project metadata and dependency information
└── tsconfig.json                   # TypeScript compiler configuration settings
