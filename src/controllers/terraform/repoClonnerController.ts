import Docker from '../../models/docker.model';
import { Request, Response } from "express";
import { spawn } from "child_process";

/**
 * Run a command and push logs to SSE or buffer.
 */
const runCommand = (
  cmd: string[],
  label: string,
  res: Response | null,
  streaming: boolean,
  logs: string[]
) => {
  return new Promise<{ code: number | null; output: string }>((resolve, reject) => {
    const proc = spawn(cmd[0], cmd.slice(1), { stdio: ["ignore", "pipe", "pipe"] });

    let output = "";

    const pushLog = (chunk: string) => {
      const lines = chunk.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const msg = `${label}${line}`;
        logs.push(msg);
        if (streaming && res) {
          res.write(`data: ${msg}\n\n`); // send log line as SSE message
        }
      }
    };

    proc.stdout.on("data", (d: Buffer) => {
      const s = d.toString();
      output += s;
      pushLog(s);
    });

    proc.stderr.on("data", (d: Buffer) => {
      const s = d.toString();
      output += s;
      pushLog(s);
    });

    proc.on("error", (err) => {
      const msg = `${label}process error: ${err.message}`;
      logs.push(msg);
      if (streaming && res) res.write(`data: ${msg}\n\n`);
      reject(err);
    });

    proc.on("close", (code) => {
      resolve({ code, output });
    });
  });
};

/**
 * API: Clone a GitHub repo into a fresh Terraform container
 * Route: POST /clone-repo/:owner/:repo
 * Query: ?stream=true  → enables realtime logs via SSE
 * Body: { dockerID: string }
 */
export const cloneRepoIntoContainer = async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const { dockerID } = req.body;
  const streaming = String(req.query.stream || "false").toLowerCase() === "true";

  const logs: string[] = [];

  try {
    if (!dockerID) {
      return res.status(400).json({ error: "dockerID is required in body" });
    }

    const dockerUser = await Docker.findOne({ dockerID });
    if (!dockerUser) {
      return res.status(404).json({ error: "Docker user not found" });
    }
    const dockerUsername = dockerUser.dockerUsername;

    const repoUrl = `https://github.com/${owner}/${repo}.git`;
    const imageName = `${dockerUsername}/terraform-gh:latest`;

    // --- SSE setup ---
    if (streaming) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // disables buffering on nginx
      res.flushHeaders?.(); // flush headers immediately if supported
      res.write(`: connected\n\n`);
      res.write(`data: Starting clone process for ${owner}/${repo}\n\n`);
    }

    // Step 1: Pull image
    logs.push(`STEP: Pulling image ${imageName}`);
    if (streaming) res.write(`data: STEP: Pulling image ${imageName}\n\n`);
    const pullResult = await runCommand(
      ["docker", "pull", imageName],
      "PULL: ",
      streaming ? res : null,
      streaming,
      logs
    );
    if (pullResult.code !== 0) {
      const msg = `Failed to pull image (exit ${pullResult.code})`;
      logs.push(msg);
      if (streaming) {
        res.write(`data: ${msg}\n\n`);
        res.write(`event: result\ndata: ${JSON.stringify({ success: false, logs })}\n\n`);
        return res.end();
      }
      return res.status(500).json({ success: false, error: msg, logs });
    }

    logs.push(`STEP: Image pulled: ${imageName}`);
    if (streaming) res.write(`data: STEP: Image pulled: ${imageName}\n\n`);

    // Step 2: Start container
    logs.push(`STEP: Starting container from ${imageName}`);
    if (streaming) res.write(`data: STEP: Starting container from ${imageName}\n\n`);
    const runResult = await runCommand(
      ["docker", "run", "-d", "-it", imageName, "bash"],
      "RUN: ",
      streaming ? res : null,
      streaming,
      logs
    );
    const containerId = runResult.output.split(/\r?\n/).find(Boolean) || null;
    if (!containerId) {
      const msg = "Failed to start container (no container id)";
      logs.push(msg);
      if (streaming) {
        res.write(`data: ${msg}\n\n`);
        res.write(`event: result\ndata: ${JSON.stringify({ success: false, logs })}\n\n`);
        return res.end();
      }
      return res.status(500).json({ success: false, error: msg, logs });
    }

    logs.push(`STEP: Container started: ${containerId}`);
    if (streaming) res.write(`data: STEP: Container started: ${containerId}\n\n`);

    // Step 3: Ensure workspace dir
    await runCommand(
      ["docker", "exec", containerId, "mkdir", "-p", "/workspace"],
      "MKDIR: ",
      streaming ? res : null,
      streaming,
      logs
    );

    // Step 4: Clone repo
    logs.push(`STEP: Cloning repo ${repoUrl} into /workspace/${repo}`);
    if (streaming) res.write(`data: STEP: Cloning repo ${repoUrl} into /workspace/${repo}\n\n`);
    const cloneResult = await runCommand(
      ["docker", "exec", containerId, "git", "clone", repoUrl, `/workspace/${repo}`],
      "CLONE: ",
      streaming ? res : null,
      streaming,
      logs
    );
    if (cloneResult.code !== 0) {
      const msg = `git clone failed (exit ${cloneResult.code})`;
      logs.push(msg);
      if (streaming) {
        res.write(`data: ${msg}\n\n`);
        res.write(`event: result\ndata: ${JSON.stringify({ success: false, containerId, logs })}\n\n`);
        return res.end();
      }
      return res.status(500).json({ success: false, error: msg, containerId, logs });
    }

    logs.push(`STEP: Repo cloned into /workspace/${repo}`);
    if (streaming) res.write(`data: STEP: Repo cloned into /workspace/${repo}\n\n`);

    const resultPayload = {
      success: true,
      message: "Repo cloned into container",
      containerId,
      repoPath: `/workspace/${repo}`,
      logs,
    };

    if (streaming) {
      res.write(`event: result\ndata: ${JSON.stringify(resultPayload)}\n\n`);
      return res.end();
    }
    return res.json(resultPayload);

  } catch (err: any) {
    const msg = err?.message || String(err);
    logs.push(`ERROR: ${msg}`);
    if (streaming) {
      res.write(`data: ERROR: ${msg}\n\n`);
      res.write(`event: result\ndata: ${JSON.stringify({ success: false, error: msg, logs })}\n\n`);
      return res.end();
    }
    return res.status(500).json({ success: false, error: msg, logs });
  }
};
