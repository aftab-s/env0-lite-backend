import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  userId: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true }, // UUID or ObjectId string
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true }, // e.g., "admin", "user"
  },
  { timestamps: true }
);

export default model<UserDocument>('User', userSchema);
