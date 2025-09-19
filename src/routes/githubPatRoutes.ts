// routes/githubPatRoutes.ts
import { Router } from "express";
import {
  savePAT,
  getRepos,
  getRepoContents,
  getRepoTree,
} from "../controllers/github/githubPatController";

const router = Router();

router.post("/save-pat", savePAT);
router.get("/repos/:email", getRepos);
router.get("/repos/:email/:owner/:repo/contents/*", getRepoContents);
router.get("/repos/:email/:owner/:repo/tree", getRepoTree);

export default router;
