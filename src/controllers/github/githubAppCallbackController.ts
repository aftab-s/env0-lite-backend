import { Request, Response } from 'express';
import axios from 'axios';

// Handles GitHub App installation redirect
export const githubAppCallback = async (req: Request, res: Response) => {
  // GitHub redirects with installation_id and setup_action in query
  const { installation_id, setup_action } = req.query;

  if (!installation_id) {
    return res.status(400).json({ error: 'Missing installation_id in callback' });
  }

  // Optionally, you can fetch installation details from GitHub API here
  // const token = ... (if you want to auto-fetch files or repos)

  // For now, just return the installation_id and setup_action to the frontend
  // (Frontend can POST this to your /github/app/files endpoint)
  res.json({ installationId: installation_id, setupAction: setup_action });
};
