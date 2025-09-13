import { Request, Response } from "express";
import { GithubService } from "../../services/githubService";

const GithubController = {
  async listRepos(req: Request, res: Response) {
    const token = req.headers.authorization?.split(" ")[1] || req.body.provider_token;
    if (!token) return res.status(400).json({ error: "GitHub token required" });

    try {
      const repos = await GithubService.listRepos(token);
      res.json(repos.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getFile(req: Request, res: Response) {
    const token = req.headers.authorization?.split(" ")[1] || req.body.provider_token;
    const { owner, repo, path } = req.body;

    if (!token || !owner || !repo || !path) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      const file = await GithubService.getFile(owner, repo, path, token);
      res.json(file.data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = GithubController;