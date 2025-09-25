import { Request, Response } from "express";
import { spawn } from "child_process";
import dotenv from "dotenv";

import Project from "../../models/project.schema";
import Space from "../../models/space.schema";

dotenv.config();

/**
 * POST /projects/:projectId/clone
 * Streams logs while cloning the repo inside container
 * Creates spaces for each root-level folder
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

    // ---- SSE headers ----
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendLog = (msg: string) => {
      res.write(`data: ${msg}\n\n`);
    };

    // Step 1: Create folder & clone repo
    sendLog(`Cloning repo ${project.repoUrl} into ${workspacePath}...\n`);

    const cloneProcess = spawn("docker", [
      "exec",
      containerId,
      "sh",
      "-c",
      `mkdir -p ${workspacePath} && git clone -b ${project.branch || "main"} ${project.repoUrl} ${workspacePath}`
    ]);

    cloneProcess.stdout.on("data", (data) => {
      sendLog(data.toString());
    });

    cloneProcess.stderr.on("data", (data) => {
      sendLog("[ERROR] " + data.toString());
    });

    cloneProcess.on("close", async (code) => {
      if (code !== 0) {
        sendLog(`Clone failed with exit code ${code}`);
        res.end();
        return;
      }

      sendLog("✅ Clone completed. Reading root folders...");

      // Step 2: List root-level folders
      const listProcess = spawn("docker", [
        "exec",
        containerId,
        "sh",
        "-c",
        `cd ${workspacePath} && ls -d */ || true`
      ]);

      let folderBuffer = "";
      listProcess.stdout.on("data", (data) => {
        folderBuffer += data.toString();
        sendLog(data.toString());
      });

      listProcess.stderr.on("data", (data) => {
        sendLog("[ERROR] " + data.toString());
      });

      listProcess.on("close", async () => {
        const folderNames = folderBuffer
          .split("\n")
          .map((f) => f.replace("/", "").trim())
          .filter((f) => f.length > 0);

        const spaces = [];
        for (const folder of folderNames) {
          const space = await Space.create({
            spaceName: folder,
            ownerId: user.userId,
            projectId: project.projectId,
          });
          spaces.push(space);
          sendLog(`📂 Space created for folder: ${folder}`);
        }

        sendLog("🎉 All spaces created successfully!");
        res.write(`data: ${JSON.stringify({ success: true, spaces })}\n\n`);
        res.end();
      });
    });
  } catch (err: any) {
    console.error("Clone error:", err);
    res.write(`data: [ERROR] ${err.message}\n\n`);
    res.end();
  }
};
