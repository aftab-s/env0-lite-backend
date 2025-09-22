import { Router } from "express";
import * as ProjectController from "../controllers/github/projectController";
import { authenticateToken } from "../middleware/tokenManagement";

const router = Router();

// All project routes require authentication
router.post("/create-projects", authenticateToken, ProjectController.createProject);
router.get("/projects", authenticateToken, ProjectController.getProjects);
router.get("/get-project-byId/:projectId", authenticateToken, ProjectController.getProjectById);
router.put("/projects/:projectId", authenticateToken, ProjectController.updateProject);

export default router;
