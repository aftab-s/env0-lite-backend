import { Request, Response } from "express";
import { spawn } from "child_process";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

import Project from "../../models/project.schema"; 

dotenv.config();

/**
 * POST /projects/:projectId/inject-to-container
 * Clones the repo inside container and creates spaces for each root-level folder
 * Returns logs and result in JSON response
 */
export const cloneRepoAndCreateSpaces = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get project info
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.repoUrl || !project.projectName) {
      return res.status(400).json({ error: "Project repoUrl or name missing" });
    }

    const containerId = process.env.CONTAINERID;
    if (!containerId) {
      return res.status(500).json({ error: "CONTAINERID not set in env" });
    }

    const workspacePath = `/workspace/${project.projectName}`;

    let logs = "";

    const appendLog = (msg: string) => {
      logs += msg + "\n";
    };

    // Step 1: Create folder & clone repo
    appendLog(`Cloning repo ${project.repoUrl} into ${workspacePath}...`);

    const cloneProcess = spawn("docker", [
      "exec",
      containerId,
      "sh",
      "-c",
      `mkdir -p "${workspacePath}" && git clone -b "${project.branch || "main"}" "${project.repoUrl}" "${workspacePath}"`
    ]);

    cloneProcess.stdout.on("data", (data) => {
      appendLog(data.toString());
    });

    cloneProcess.stderr.on("data", (data) => {
      appendLog("[ERROR] " + data.toString());
    });

    await new Promise<void>((resolve, reject) => {
      cloneProcess.on("close", (code) => {
        if (code !== 0) {
          appendLog(`Clone failed with exit code ${code}`);
          reject(new Error(`Clone failed with exit code ${code}`));
        } else {
          appendLog("✅ Clone completed. Reading root folders...");
          resolve();
        }
      });
    });

    // Step 2: List root-level folders
    const listProcess = spawn("docker", [
      "exec",
      containerId,
      "sh",
      "-c",
      `cd "${workspacePath}" && ls -d */ || true`
    ]);

    let folderBuffer = "";
    listProcess.stdout.on("data", (data) => {
      folderBuffer += data.toString();
      appendLog(data.toString());
    });

    listProcess.stderr.on("data", (data) => {
      appendLog("[ERROR] " + data.toString());
    });

    await new Promise<void>((resolve, reject) => {
      listProcess.on("close", (code) => {
        if (code !== 0) {
          appendLog(`List folders failed with exit code ${code}`);
          reject(new Error(`List folders failed with exit code ${code}`));
        } else {
          resolve();
        }
      });
    });

    const folderNames = folderBuffer
      .split("\n")
      .map((f) => f.replace("/", "").trim())
      .filter((f) => f.length > 0);

    const newSpaces = folderNames.map((folder) => ({
      spaceId: uuidv4(),
      spaceName: folder,
      spaceDescription: "",
    }));

    // Push into project.spaces[]
    project.spaces = [...project.spaces, ...newSpaces];
    await project.save();

    for (const space of newSpaces) {
      appendLog(`📂 Space created: ${space.spaceName} (${space.spaceId})`);
    }

    appendLog("🎉 All spaces created successfully!");

    res.json({
      success: true,
      spaces: newSpaces,
      logs: logs.trim(),
    });
  } catch (err: any) {
    console.error("Clone error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      logs: (err as any).logs || "",
    });
  }
};