import { Request, Response } from "express";
import { spawn } from "child_process";
import Project from "../../models/project.schema";

/**
 * Utility: stream any commands inside a container workspace via SSE
 */
const streamCommands = (
  res: Response,
  containerId: string,
  workspacePath: string,
  commands: string[]
) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const fullCmd = commands.join(" && ");

  const proc = spawn("docker", ["exec", "-i", containerId, "sh", "-c", `cd ${workspacePath} && ${fullCmd}`]);

  proc.stdout.on("data", (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  proc.stderr.on("data", (data) => {
    res.write(`data: [ERROR] ${data.toString()}\n\n`);
  });

  proc.on("close", (code) => {
    res.write(`event: done\ndata: Process exited with code ${code}\n\n`);
    res.end();
  });

  proc.on("error", (err) => {
    res.write(`event: error\ndata: ${err.message}\n\n`);
    res.end();
  });
};

/**
 * POST /projects/:projectId/terraform/init-plan
 * Runs 'terraform init' and 'terraform plan' for a given space
 */
export const terraformInitPlan = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { spaceName } = req.body;

    if (!spaceName) return res.status(400).json({ error: "spaceName is required" });

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const containerId = process.env.CONTAINERID;
    if (!containerId) return res.status(500).json({ error: "CONTAINERID not set" });

    const workspacePath = `/workspace/${project.projectName}/${spaceName}`;

    streamCommands(res, containerId, workspacePath, [
      "terraform init -input=false -no-color",
      "terraform plan -input=false -no-color"
    ]);
  } catch (err: any) {
    console.error("Terraform init/plan error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /projects/:projectId/terraform/apply
 * Runs 'terraform apply --auto-approve' for a given space
 */
export const terraformApply = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { spaceName } = req.body;

    if (!spaceName) return res.status(400).json({ error: "spaceName is required" });

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const containerId = process.env.CONTAINERID;
    if (!containerId) return res.status(500).json({ error: "CONTAINERID not set" });

    const workspacePath = `/workspace/${project.projectName}/${spaceName}`;

    streamCommands(res, containerId, workspacePath, [
      "terraform apply -auto-approve -input=false -no-color"
    ]);
  } catch (err: any) {
    console.error("Terraform apply error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /projects/:projectId/terraform/destroy
 * Runs 'terraform destroy --auto-approve' for a given space
 */
export const terraformDestroy = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { spaceName } = req.body;

    if (!spaceName) return res.status(400).json({ error: "spaceName is required" });

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const containerId = process.env.CONTAINERID;
    if (!containerId) return res.status(500).json({ error: "CONTAINERID not set" });

    const workspacePath = `/workspace/${project.projectName}/${spaceName}`;

    streamCommands(res, containerId, workspacePath, [
      "terraform destroy -auto-approve -input=false -no-color"
    ]);
  } catch (err: any) {
    console.error("Terraform destroy error:", err);
    res.status(500).json({ error: err.message });
  }
};
