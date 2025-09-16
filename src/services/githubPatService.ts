import { Octokit } from 'octokit';

export const getOctokitForPAT = (pat: string) => {
  return new Octokit({ auth: pat });
};

export const fetchUserRepos = async (pat: string) => {
  const octokit = getOctokitForPAT(pat);
  const res = await octokit.rest.repos.listForAuthenticatedUser();
  return res.data;
};

export const fetchRepoContents = async (pat: string, owner: string, repo: string, path: string) => {
  const octokit = getOctokitForPAT(pat);
  const res = await octokit.rest.repos.getContent({ owner, repo, path });
  return res.data;
};
