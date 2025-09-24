import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IProject extends Document {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  ownerId?: string;
  ownerName?: string;
  repoUrl?: string;
  branch?: string;
  csp?: "aws" | "gcp" | "azure";
  status: "idle" | "running" | "error";
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    projectId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    projectDescription: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
    },
    repoUrl: {
      type: String,
    },
    branch: {
      type: String,
    },
    csp: {
      type: String,
      enum: ["aws", "gcp", "azure"],
    },
    status: {
      type: String,
      enum: ["idle", "running", "error"],
      default: "idle",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
