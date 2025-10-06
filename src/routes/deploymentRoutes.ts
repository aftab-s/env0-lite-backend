import { Router } from "express";
import { getDeployments, getDeploymentSummary } from "../controllers/deployment/deploymentController";
import { authenticateToken } from "../middleware/tokenManagement";

const router = Router();


router.get("/", getDeployments);

export default router;