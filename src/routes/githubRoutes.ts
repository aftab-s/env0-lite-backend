import { Router } from 'express';
import { getRepoContents } from '../controllers/github/githubController';
import { getRepoContentsWithApp } from '../controllers/github/githubAppController';
import { githubAppCallback } from '../controllers/github/githubAppCallbackController';

const router = Router();

/**
 * @swagger
 * /github/files/{owner}/{repo}:
 *   get:
 *     summary: Get files and folders from a GitHub repository
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: owner
 *         schema:
 *           type: string
 *         required: true
 *         description: GitHub repository owner
 *       - in: path
 *         name: repo
 *         schema:
 *           type: string
 *         required: true
 *         description: GitHub repository name
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *         required: false
 *         description: Subpath inside the repository
 *     responses:
 *       200:
 *         description: List of files and folders
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get('/github/files/:owner/:repo', getRepoContents);

export default router;

/**
 * @swagger
 * /api/github/callback:
 *   get:
 *     summary: GitHub App installation callback
 *     tags: [GitHub]
 *     parameters:
 *       - in: query
 *         name: installation_id
 *         schema:
 *           type: string
 *         required: true
 *         description: GitHub App installation ID
 *       - in: query
 *         name: setup_action
 *         schema:
 *           type: string
 *         required: false
 *         description: Setup action (e.g., install)
 *     responses:
 *       200:
 *         description: Installation ID and setup action returned
 *       400:
 *         description: Missing installation_id
 */
router.get('/api/github/callback', githubAppCallback);

/**
 * @swagger
 * /github/app/files:
 *   post:
 *     summary: Get files and folders from a GitHub repo using GitHub App installation
 *     tags: [GitHub]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - installationId
 *               - owner
 *               - repo
 *             properties:
 *               installationId:
 *                 type: integer
 *               owner:
 *                 type: string
 *               repo:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of files and folders
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.post('/github/app/files', getRepoContentsWithApp);
