import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  userId: string;
  username: string;
  password: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true }, // UUID
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default model<UserDocument>('User', userSchema);
