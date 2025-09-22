import { Router } from 'express';
import { createDockerUser, getDockerUser } from '../controllers/auth/dockerController';
import { cloneRepoIntoContainer } from '../controllers/terraform/repoClonnerController';

const router = Router();

// POST /api/docker
router.post('/add-username', createDockerUser);

// GET /api/docker/:dockerID
router.get('/docker/:dockerID', getDockerUser);


// POST /api/docker/clone-repo/:owner/:repo
router.post('/clone-repo/:owner/:repo', cloneRepoIntoContainer);

export default router;
