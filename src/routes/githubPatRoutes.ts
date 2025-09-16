import { Router } from 'express';
import { savePAT, getRepos, getRepoContents } from '../controllers/github/githubPatController';

const router = Router();

router.post('/save-pat', savePAT);
router.get('/repos/:email', getRepos);
router.get('/repos/:email/:owner/:repo/contents/*', getRepoContents);

export default router;
