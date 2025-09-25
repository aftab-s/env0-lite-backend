import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ILog extends Document {
  logId: string;
  projectId: string;
  spaceId: string;
  message: string;
  level: "info" | "warn" | "error";
  timestamp: Date;
}

const LogSchema: Schema = new Schema(
  {
    logId: { type: String, default: uuidv4, unique: true, required: true },
    projectId: { type: String, required: true, index: true },
    spaceId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    level: { type: String, enum: ["info", "warn", "error"], default: "info" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index → get logs per project + space fast
LogSchema.index({ projectId: 1, spaceId: 1, timestamp: -1 });

export default mongoose.model<ILog>("Log", LogSchema);
