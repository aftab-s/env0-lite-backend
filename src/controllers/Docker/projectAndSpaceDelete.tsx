import { Request, Response } from "express";
import Project from "../../models/project.schema";
import { spawn, execSync } from "child_process";

/**
 * DELETE /projects/:projectId
 * Deletes project, related spaces, and workspace from container
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not found in token" });
    }

    // Find project to verify ownership
    const project = await Project.findOne({ projectId, ownerId: user.userId });
    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found or access denied" });
    }

    const ids = getContainerIdsByImage('thebagelproject/bagel-server:latest');
    if (ids.length === 0) {
      return res.status(500).json({ error: 'No containers found for the image' });
    }
    const containerId = ids[0];

    // Delete workspace from container
    const workspacePath = `/workspace/${project.projectName}`;
    const runDockerCmd = (args: string[]) =>
      new Promise<void>((resolve, reject) => {
        const proc = spawn("docker", ["exec", containerId, "sh", "-c", args.join(" ")]);
        let error = "";
        proc.stderr.on("data", (d) => (error += d.toString()));
        proc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(error || `Command failed with code ${code}`));
        });
      });

    // Remove workspace directory from container
    try {
      await runDockerCmd([`rm -rf "${workspacePath}"`]);
    } catch (err) {
      console.warn("Failed to remove workspace from container:", err);
      // Continue with DB deletion even if container cleanup fails
    }

    // Delete project from DB (this will also remove spaces due to cascade or manual deletion)
    await Project.findOneAndDelete({ projectId, ownerId: user.userId });

    res.json({
      success: true,
      message: `Project '${project.projectName}' and all related data deleted successfully`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get container IDs by image name
 */
function getContainerIdsByImage(imageName: string): string[] {
  try {
    const cmd = `docker ps -q --filter "ancestor=${imageName}"`;
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (err) {
    console.error(`Failed to get containers for image "${imageName}":`, (err as Error).message);
    return [];
  }
}