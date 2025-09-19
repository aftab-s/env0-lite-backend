// routes/githubPatRoutes.ts
import { Router } from "express";
import {
  savePAT,
  getRepos,
  getRepoContents, getFileContent,
  getRepoTree,
} from "../controllers/github/githubPatController";

const router = Router();

router.post("/save-pat", savePAT);
router.get("/repos/:email", getRepos);

//API to get the content of a specific file in a repo
router.get('/repos/:email/:owner/:repo/file/*/:filename', getFileContent);

router.get("/repos/:email/:owner/:repo/contents/*", getRepoContents);
router.get("/repos/:email/:owner/:repo/tree", getRepoTree);

export default router;
