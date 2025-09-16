import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbConnection";

import { setupSwagger } from "./config/swagger";

const PORT = process.env.PORT || 5000;


// Swagger setup (moved to config/swagger.ts)


// Routes
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import githubPatRoutes from "./routes/githubPatRoutes";

const MONGO_URI = process.env.MONGO_URI;
const COOKIE_SECRET = process.env.SESSION_COOKIE_SECRET || "dev-secret";

// Initialize express
const app = express();
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

// Setup Swagger after app is initialized
setupSwagger(app);



// Register routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/github-pat", githubPatRoutes);


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
