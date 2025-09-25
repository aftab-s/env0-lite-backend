import { Request, Response } from "express";
import * as ProjectRepository from "../../repositories/project.repository";

/**
 * 1. Create Project
 * POST /projects
 * Body: { name, description }
 * OwnerId is taken from authenticated user
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    const { projectName, projectDescription} = req.body;
    const user = (req as any).user;

    if (!projectName) {
      return res.status(400).json({ error: "Project Name is required" });
    }
    if (!user || !user.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not found in token" });
    }

    const project = await ProjectRepository.createProject(projectName, projectDescription);
    project.ownerId = user.userId; // explicitly bind owner
    await project.save();

    res.status(201).json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 2. Update CSP
 * PUT /projects/:projectId/csp
 * Body: { csp }
 */
export const updateProjectCsp = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { csp } = req.body;

    if (!csp) {
      return res.status(400).json({ success: false, error: "csp is required" });
    }

    const project = await ProjectRepository.updateProjectCsp(projectId, csp);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 3. Update Repo Details
 * PUT /projects/:projectId/repo
 * Body: { repoUrl, ownerName, branch }
 */
export const updateProjectRepo = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { repoUrl, ownerName, branch } = req.body;

    if (!repoUrl || !ownerName || !branch) {
      return res.status(400).json({
        success: false,
        error: "repoUrl, ownerName, and branch are required",
      });
    }

    const project = await ProjectRepository.updateProjectRepo(
      projectId,
      repoUrl,
      ownerName,
      branch
    );

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 4. Get All Projects
 * GET /projects
 */
export const getProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await ProjectRepository.getAllProjects();
    res.json({ success: true, projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 5. Get Project by ID
 * GET /projects/:projectId
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

