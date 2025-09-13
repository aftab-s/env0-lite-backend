import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbConnection";

// Routes
// import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/authRoutes";
import githubRoutes from "./routes/githubRoutes";

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const COOKIE_SECRET = process.env.SESSION_COOKIE_SECRET || "dev-secret";

// Initialize express
const app = express();
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

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
