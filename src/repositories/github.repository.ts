import axios from 'axios';
import { GitHubContent } from '../types/github.types';

export const fetchRepoContents = async (
  owner: string,
  repo: string,
  path: string = '',
  token?: string
): Promise<GitHubContent[]> => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  const authToken = token || process.env.GITHUB_TOKEN;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const response = await axios.get(url, { headers });
  return response.data;
};
