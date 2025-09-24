import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ISpace extends Document {
  spaceId: string;          // Unique UUID for the space
  spaceName: string;        // Name of the space (folder name)
  spacedescription?: string; // Optional description
  ownerId: string;          // User who owns the space
  projectId: string;        // Linked projectId
  createdAt: Date;
  updatedAt: Date;
}

const spaceSchema = new Schema<ISpace>(
  {
    spaceId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    spaceName: {
      type: String,
      required: true,
      trim: true,
    },
    spacedescription: {
      type: String,
      default: "",
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Space = model<ISpace>("Space", spaceSchema);
export default Space;
