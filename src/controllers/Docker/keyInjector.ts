import { Request, Response } from "express";
import { spawn } from "child_process";
import Project from "../../models/project.schema";

/**
 * PUT /projects/:projectId/profile
 * Updates the AWS profile for a project.
 * - Stores only profileName in Mongo
 * - Configures credentials inside the container
 */
export const configureAwsProfile = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { profileName, accessKeyId, secretAccessKey, region } = req.body;

    if (!profileName || !accessKeyId || !secretAccessKey) {
      return res.status(400).json({
        error: "profileName, accessKeyId, and secretAccessKey are required",
      });
    }

    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const containerId = process.env.CONTAINERID;
    if (!containerId) {
      return res.status(500).json({ error: "CONTAINERID not set" });
    }

    const runAwsCmd = (args: string[]) =>
      new Promise<void>((resolve, reject) => {
        const proc = spawn("docker", ["exec", containerId, "aws", ...args]);
        let error = "";
        proc.stderr.on("data", (d) => (error += d.toString()));
        proc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(error || `Command failed with code ${code}`));
        });
      });

    // Configure AWS credentials in container
    await runAwsCmd([
      "configure",
      "set",
      "aws_access_key_id",
      accessKeyId,
      "--profile",
      profileName,
    ]);
    await runAwsCmd([
      "configure",
      "set",
      "aws_secret_access_key",
      secretAccessKey,
      "--profile",
      profileName,
    ]);
    await runAwsCmd([
      "configure",
      "set",
      "region",
      region || "us-east-1",
      "--profile",
      profileName,
    ]);
    await runAwsCmd([
      "configure",
      "set",
      "output",
      "json",
      "--profile",
      profileName,
    ]);

    // Save only profileName in DB
    project.profile = profileName;
    await project.save();

    // Check if step 3 is complete
    if (project.csp && project.profile) {
      project.steps = "step-3-complete";
      await project.save();
    }

    res.json({
      success: true,
      message: `Profile '${profileName}' configured successfully`,
      profile: profileName,
    });
  } catch (err: any) {
    console.error("AWS profile configure error:", err);
    res.status(500).json({ error: err.message });
  }
};



// Delete Profile Name from Mongo and Container
export const deleteAwsProfile = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({ projectId });
    if (!project
      
    ) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.profile) {
      return res.status(400).json({ error: "No profile set for this project" });
    }

    const containerId = process.env.CONTAINERID;
    if (!containerId) {
      return res.status(500).json({ error: "CONTAINERID not set" });
    }

    const profileName = project.profile;

    // Helper to run docker commands inside container
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

    // Step 1: Remove profile from ~/.aws/config and ~/.aws/credentials
    // We assume Alpine container has `sed`
    await runDockerCmd([
      `sed -i '/\\[profile ${profileName}\\]/,/^$/d' /root/.aws/config || true`,
    ]);
    await runDockerCmd([
      `sed -i '/\\[${profileName}\\]/,/^$/d' /root/.aws/credentials || true`,
    ]);

    // Step 2: Remove profile from Mongo
    project.profile = undefined as any;
    await project.save();

    res.json({
      success: true,
      message: `Profile '${profileName}' deleted from DB and container`,
    });
  } catch (err: any) {
    console.error("AWS profile delete error:", err);
    res.status(500).json({ error: err.message });
  }
};
