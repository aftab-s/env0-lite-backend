import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IDocker extends Document {
	dockerID: string;
	dockerUsername: string;
}

const DockerSchema: Schema = new Schema({
	dockerID: {
		type: String,
		default: uuidv4,
		unique: true,
		required: true
	},
	dockerUsername: {
		type: String,
		required: true,
		unique: true
	}
});

export default mongoose.model<IDocker>('Docker', DockerSchema);
