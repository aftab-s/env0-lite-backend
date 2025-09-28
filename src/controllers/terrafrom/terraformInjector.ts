import { Request, Response } from "express";
import { spawn } from "child_process";
import Project from "../../models/project.schema";
import * as LogsRepository from "../../repositories/logs.reposiory";
import { v4 as uuidv4 } from "uuid";

type CommandResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  summary: {
    toAdd?: number;
    toChange?: number;
    toDestroy?: number;
    added?: number;
    changed?: number;
    destroyed?: number;
  } | null;
};

/**
 * Parse Terraform output into structured summary (init, apply, destroy only)
 */
const parseTerraformSummary = (stdout: string): CommandResult["summary"] => {
  let summary: CommandResult["summary"] | null = null;
  const lines = stdout.split("\n");

  for (const line of lines) {
    const planMatch = line.match(
      /Plan:\s+(\d+)\s+to add,\s+(\d+)\s+to change,\s+(\d+)\s+to destroy/
    );
    if (planMatch) {
      summary = {
        toAdd: parseInt(planMatch[1], 10),
        toChange: parseInt(planMatch[2], 10),
        toDestroy: parseInt(planMatch[3], 10),
      };
      break;
    }

    const applyMatch = line.match(
      /Apply complete! Resources:\s+(\d+)\s+added,\s+(\d+)\s+changed,\s+(\d+)\s+destroyed/
    );
    if (applyMatch) {
      summary = {
        added: parseInt(applyMatch[1], 10),
        changed: parseInt(applyMatch[2], 10),
        destroyed: parseInt(applyMatch[3], 10),
      };
      break;
    }

    const destroyMatch = line.match(/Destroy complete! Resources:\s+(\d+)\s+destroyed/);
    if (destroyMatch) {
      summary = {
        destroyed: parseInt(destroyMatch[1], 10),
      };
      break;
    }
  }

  return summary;
};

/**
 * Utility: run commands inside a container workspace and collect output
 */
const runCommands = (
  containerId: string,
  workspacePath: string,
  commands: string[]
): Promise<CommandResult> => {
  return new Promise((resolve, reject) => {
    const safePath = workspacePath.replace(/(["\s'$`\\])/g, "\\$1");
    const fullCmd = commands.join(" && ");
    const wrappedCmd = `cd ${safePath} && ${fullCmd}`;

    const proc = spawn("docker", [
      "exec",
      "-i",
      "-e",
      "TF_IN_AUTOMATION=true",
      "-e",
      "FORCE_COLOR=0",
      containerId,
      "bash",
      "-c",
      wrappedCmd,
    ]);

    proc.stdout.setEncoding("utf8");
    proc.stderr.setEncoding("utf8");

    let stdoutBuffer = "";
    let stderrBuffer = "";

    proc.stdout.on("data", (data) => {
      stdoutBuffer += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderrBuffer += data.toString();
    });

    proc.on("close", (code) => {
      resolve({
        exitCode: code,
        stdout: stdoutBuffer,
        stderr: stderrBuffer,
        summary: parseTerraformSummary(stdoutBuffer),
      });
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
};

/**
 * POST /projects/:projectId/terraform/init
 */
export const terraformInit = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { spaceName } = req.body;

    if (!spaceName) return res.status(400).json({ error: "spaceName is required" });

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const containerId = process.env.CONTAINERID;
    if (!containerId) return res.status(500).json({ error: "CONTAINERID not set" });

    const workspacePath = `/workspace/${project.projectName}/${spaceName}`;

    const result = await runCommands(containerId, workspacePath, [
      "terraform init -input=false -no-color",
    ]);

    // --- Create new deployment log only if not exists ---
    const deploymentName = `${project.projectName} ${spaceName} Deployment-${new Date().toLocaleDateString("en-US")}`;
    const logId = uuidv4();

    const logDoc = await LogsRepository.createDeploymentLog({
      logId,
      projectId,
      spaceId: spaceName,
      deploymentName,
      step: "init",
      stepStatus: result.exitCode === 0 ? "successful" : "failed",
      message: result.stdout || result.stderr,
    });

    res.json({ command: "terraform init", logId: logDoc.logId, ...result });
  } catch (err: any) {
    console.error("Terraform init error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /projects/:projectId/terraform/plan
 * Uses terraform show -json for stable machine-readable output
 */
export const terraformPlan = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { spaceName, logId } = req.body;

    if (!spaceName) return res.status(400).json({ error: "spaceName is required" });
    if (!logId) return res.status(400).json({ error: "logId is required (from init)" });

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const containerId = process.env.CONTAINERID;
    if (!containerId) return res.status(500).json({ error: "CONTAINERID not set" });

    const workspacePath = `/workspace/${project.projectName}/${spaceName}`;

    const humanReadablePlan = await runCommands(containerId, workspacePath, [
      "terraform plan -input=false -no-color"
    ]);

    const structuredPlan = await runCommands(containerId, workspacePath, [
      "terraform plan -input=false -no-color -out=tfplan",
      "terraform show -json tfplan"
    ]);

    let planJson: any = null;
    try {
      planJson = JSON.parse(structuredPlan.stdout);
    } catch (e) {
      console.error("Failed to parse terraform show -json:", e);
    }

    // --- Append log step to existing deployment log ---
    await LogsRepository.addLogStep({
      logId,
      step: "plan",
      stepStatus: humanReadablePlan.exitCode === 0 ? "successful" : "failed",
      message: humanReadablePlan.stdout || humanReadablePlan.stderr,
    });

    res.json({
      stepName: "Plan",
      rawFormat: humanReadablePlan.stdout,
      data: planJson,
      exitCode: humanReadablePlan.exitCode,
      stderr: humanReadablePlan.stderr,
    });
  } catch (err: any) {
    console.error("Terraform plan error:", err);
    res.status(500).json({ error: err.message });
  }
};
/**
 * POST /projects/:projectId/terraform/apply
 */
export const terraformApply = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { spaceName } = req.body;

    if (!spaceName)
      return res.status(400).json({ error: "spaceName is required" });

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const containerId = process.env.CONTAINERID;
    if (!containerId)
      return res.status(500).json({ error: "CONTAINERID not set" });

    const workspacePath = `/workspace/${project.projectName}/${spaceName}`;

    const result = await runCommands(containerId, workspacePath, [
      "terraform apply -auto-approve -input=false -no-color",
    ]);

    res.json({ command: "terraform apply", ...result });
  } catch (err: any) {
    console.error("Terraform apply error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /projects/:projectId/terraform/destroy
 */
export const terraformDestroy = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { spaceName } = req.body;

    if (!spaceName)
      return res.status(400).json({ error: "spaceName is required" });

    const project = await Project.findOne({ projectId });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const containerId = process.env.CONTAINERID;
    if (!containerId)
      return res.status(500).json({ error: "CONTAINERID not set" });

    const workspacePath = `/workspace/${project.projectName}/${spaceName}`;

    const result = await runCommands(containerId, workspacePath, [
      "terraform destroy -auto-approve -input=false -no-color",
    ]);

    res.json({ command: "terraform destroy", ...result });
  } catch (err: any) {
    console.error("Terraform destroy error:", err);
    res.status(500).json({ error: err.message });
  }
};
