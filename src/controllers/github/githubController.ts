import { fetchRepoContents } from '../../repositories/github.repository';
import { Request, Response } from 'express';

export const getRepoContents = async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const path = req.query.path as string || '';
  const token = req.headers['github-token'] as string | undefined;
  try {
    const contents = await fetchRepoContents(owner, repo, path, token);
    res.json(contents);
  } catch (err: any) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || 'Failed to fetch repo contents';
    res.status(status).json({ error: message });
  }
};
