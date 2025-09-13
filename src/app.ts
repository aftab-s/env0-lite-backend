
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbConnection";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const PORT = process.env.PORT || 5000;

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Env0 Lite Backend API",
      version: "1.0.0",
      description: "API documentation for env0-lite-backend",
    },
    servers: [
      {
  url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/**/*.ts",
  ],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
// import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/authRoutes";
import githubRoutes from "./routes/githubRoutes";

const MONGO_URI = process.env.MONGO_URI;
const COOKIE_SECRET = process.env.SESSION_COOKIE_SECRET || "dev-secret";

// Initialize express
const app = express();
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));


// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register routes
// app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);

// Connect to MongoDB and start server

const startServer = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not defined");
  }

  await connectDB(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();

export default app;
