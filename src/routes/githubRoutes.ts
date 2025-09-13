import { Router } from "express";
const GithubController = require("../controllers/github/githubController");

const router = Router();

router.post("/repos", GithubController.listRepos);
router.post("/file", GithubController.getFile);

export default router;
