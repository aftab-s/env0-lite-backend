import Project, { IProject } from '../models/project.model';

export const createProject = async (data: Partial<IProject>): Promise<IProject> => {
  return await Project.create(data);
};

export const getAllProjects = async (): Promise<IProject[]> => {
  return await Project.find();
};

export const getProjectById = async (projectId: string): Promise<IProject | null> => {
  return await Project.findOne({ projectId });
};

export const updateProject = async (
  projectId: string,
  updates: Partial<IProject>,
): Promise<IProject | null> => {
  return await Project.findOneAndUpdate({ projectId }, updates, { new: true });
};
