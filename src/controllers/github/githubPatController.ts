
import { Request, Response } from 'express';
import { upsertUserPAT, getUserPAT } from '../../repositories/userPAT.repository';
import { fetchUserRepos, fetchRepoContents } from '../../services/githubPatService';


export const savePAT = async (req: Request, res: Response) => {
  const { email, pat } = req.body;
  if (!email || !pat) return res.status(400).json({ error: 'Email and PAT required' });
  try {
    await upsertUserPAT(email, pat);
    res.json({ message: 'PAT saved' });
  } catch (err) {
    console.error('Error in savePAT:', err);
    res.status(500).json({ error: 'Failed to save PAT', details: err instanceof Error ? err.message : err });
  }
};

export const getRepos = async (req: Request, res: Response) => {
  const { email } = req.params;
  try {
    const userPat = await getUserPAT(email);
    if (!userPat) {
      return res.status(404).json({ error: 'PAT not found for user' });
    }

    const repos = await fetchUserRepos(userPat.pat);

    // Extract only the repo names
    const repoNames = repos.map((repo: any) => repo.name);

    res.json(repoNames);
  } catch (err: any) {
    if (err.status === 401) {
      return res.status(401).json({ error: 'Invalid or unauthorized PAT' });
    }
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
};

export const getRepoContents = async (req: Request, res: Response) => {
  const { email, owner, repo } = req.params;
  const path = req.params[0] || '';
  try {
    const userPat = await getUserPAT(email);
    if (!userPat) return res.status(404).json({ error: 'PAT not found for user' });
    const contents = await fetchRepoContents(userPat.pat, owner, repo, path);
    res.json(contents);
  } catch (err: any) {
    if (err.status === 401) return res.status(401).json({ error: 'Invalid or unauthorized PAT' });
    if (err.status === 404) return res.status(404).json({ error: 'Repo or path not found' });
    res.status(500).json({ error: 'Failed to fetch repo contents' });
  }
};
