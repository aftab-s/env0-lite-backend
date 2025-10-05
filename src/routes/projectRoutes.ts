import { NextFunction, Router } from "express";
import * as ProjectController from "../controllers/github/projectController";
import * as ContainerInjector from "../controllers/terrafrom/repoClonnerController"
import { configureAwsProfile, deleteAwsProfile } from "../controllers/Docker/keyInjector";
import { resetRepoAndSyncSpaces } from "../controllers/Docker/pullInjector";
// Removed: Terraform routes now in terrafromRoutes.ts
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

// Retrieve projects by owner ID (from authenticated user)
router.get("/get-projects-by-owner", authenticateToken, ProjectController.getProjectsByOwner);

// --- New Route: Clone repo & create spaces (with SSE logs) ---
router.post(
  "/:projectId/inject-to-container",
  authenticateToken,
  ContainerInjector.cloneRepoAndCreateSpaces
);

// Route: Configure AWS profile in Docker container
router.put(
  "/:projectId/configure-aws-profile",
  authenticateToken,
  configureAwsProfile
);
router.delete(
  "/:projectId/delete-aws-profile",
  authenticateToken,
  deleteAwsProfile
);

// ...existing code...

router.put("/:projectId/reset-branch", authenticateToken, resetRepoAndSyncSpaces);

export default router;
