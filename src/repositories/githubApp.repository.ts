import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { GitHubContent } from '../types/github.types';

interface InstallationTokenParams {
  installationId: number;
  owner: string;
  repo: string;
}

export const fetchRepoContentsWithApp = async ({ installationId, owner, repo }: InstallationTokenParams): Promise<GitHubContent[]> => {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;

  if (!appId || !privateKey) throw new Error('GitHub App credentials missing');

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      clientId,
      clientSecret,
      installationId,
    },
  });

  const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents', {
    owner,
    repo,
  });
  return data;
};
