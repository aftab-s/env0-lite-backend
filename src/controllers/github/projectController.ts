import { Request, Response } from "express";
import * as ProjectRepository from "../../repositories/project.repository";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, repoUrl, branch } = req.body;
    // ownerId comes from authenticated user
    const user = (req as any).user;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!user || !user.userId) {
      return res.status(401).json({ error: "Unauthorized: user not found in token" });
    }
    const ownerId = user.userId;
    const project = await ProjectRepository.createProject({
      name,
      ownerId,
      repoUrl,
      branch,
    });
    res.status(201).json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await ProjectRepository.getAllProjects();
    res.json({ success: true, projects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectRepository.getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};



export const updateProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { repoUrl, branch, name } = req.body;

    const project = await ProjectRepository.updateProject(projectId, {
      ...(repoUrl && { repoUrl }),
      ...(branch && { branch }),
      ...(name && { name }),
    });

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};