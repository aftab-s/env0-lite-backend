import { Request, Response } from 'express';
import { fetchRepoContentsWithApp } from '../../repositories/githubApp.repository';

export const getRepoContentsWithApp = async (req: Request, res: Response) => {
  const { installationId, owner, repo } = req.body;
  if (!installationId || !owner || !repo) {
    return res.status(400).json({ error: 'installationId, owner, and repo are required' });
  }
  try {
    const contents = await fetchRepoContentsWithApp({ installationId, owner, repo });
    res.json(contents);
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || 'Failed to fetch repo contents via GitHub App';
    res.status(status).json({ error: message });
  }
};
