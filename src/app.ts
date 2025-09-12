import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/dbConnection';
import userRoutes from './routes/user.routes';

// Load env vars
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Initialize express
const app = express();
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Connect to MongoDB and start server
const startServer = async () => {

  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
  }
  await connectDB(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();

export default app;
