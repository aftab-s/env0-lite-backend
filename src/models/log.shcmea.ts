import { Document } from "mongoose";

export interface DeploymentStepLog {
  step: "init" | "plan" | "apply" | "destroy";
  stepStatus: "pending" | "running" | "successful" | "failed";
  message: string;
  timestamp: Date;
}

export interface DeploymentLogs extends Document {
  logId: string;
  projectId: string;
  spaceId: string;
  deploymentName: string;
  deploymentSummary?: string;
  logs: DeploymentStepLog[];
  startedAt: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const DeploymentLogsSchema = new Schema(
  {
    logId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    spaceId: {
      type: String,
      required: true,
    },

    // --- New fields ---
    deploymentName: { type: String, required: true, unique: true }, // e.g. "Sangeeth Project EC2 Deployment-9/29/2025"
    deploymentSummary: { type: String }, // optional short text
    
    logs: [
      {
        step: { type: String, required: true }, // init | plan | apply | destroy
        stepStatus: {
          type: String,
          enum: ["pending", "running", "successful", "failed"],
          required: true,
        },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
  },
  { timestamps: true }
);

export default model("DeploymentLogs", DeploymentLogsSchema);
