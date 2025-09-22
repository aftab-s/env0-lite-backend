import { Request, Response } from 'express';
import Docker from '../../models/docker.model';

// POST /api/docker - create a new docker user
export const createDockerUser = async (req: Request, res: Response) => {
	const { dockerUsername } = req.body;
	if (!dockerUsername) {
		return res.status(400).json({ error: 'dockerUsername is required' });
	}
	try {
		const existing = await Docker.findOne({ dockerUsername });
		if (existing) {
			return res.status(409).json({ error: 'dockerUsername already exists' });
		}
		const dockerUser = await Docker.create({ dockerUsername });
		res.status(201).json({ dockerID: dockerUser.dockerID, dockerUsername: dockerUser.dockerUsername });
	} catch (err) {
		res.status(500).json({ error: 'Failed to create docker user', details: err instanceof Error ? err.message : err });
	}
};

// GET /api/docker/:dockerID - get docker user by ID
export const getDockerUser = async (req: Request, res: Response) => {
	const { dockerID } = req.params;
	try {
		const dockerUser = await Docker.findOne({ dockerID });
		if (!dockerUser) {
			return res.status(404).json({ error: 'Docker user not found' });
		}
		res.json({ dockerID: dockerUser.dockerID, dockerUsername: dockerUser.dockerUsername });
	} catch (err) {
		res.status(500).json({ error: 'Failed to get docker user', details: err instanceof Error ? err.message : err });
	}
};
