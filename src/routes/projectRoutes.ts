import { NextFunction, Router } from "express";
import * as ProjectController from "../controllers/github/projectController";
import * as ContainerInjector from "../controllers/Docker/repoClonnerController"
import { authenticateToken } from "../middleware/tokenManagement";

const router = Router();


// Create a new project
// - Generates a projectId (UUID) and stores projectName, projectDescription, creationTime, and ownerId
router.post("/create-project", authenticateToken, ProjectController.createProject);

// Update the CSP (Cloud Service Provider) field for a specific project
router.put("/:projectId/csp", authenticateToken, ProjectController.updateProjectCsp);

// Update repository details (repoURL, ownerName, branch) for a specific project
router.put("/:projectId/repo", authenticateToken, ProjectController.updateProjectRepo);

// Retrieve all projects
router.get("/get-all-projects", authenticateToken, ProjectController.getProjects);

// Retrieve a project by its ID
router.get("/get-project-by-id/:projectId", authenticateToken, ProjectController.getProjectById);

// --- New Route: Clone repo & create spaces (with SSE logs) ---
router.post(
  "/:projectId/inject-to-container",
  authenticateToken,
  ContainerInjector.cloneRepoAndCreateSpaces
);

export default router;
