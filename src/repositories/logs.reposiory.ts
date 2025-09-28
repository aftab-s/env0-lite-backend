import DeploymentLogs from "../models/log.shcmea";

export const createDeploymentLog = async ({
  logId,
  projectId,
  spaceId,
  deploymentName,
  step,
  stepStatus,
  message,
}: any) => {
  // Only create if not exists
  return DeploymentLogs.findOneAndUpdate(
    { logId },
    {
      $setOnInsert: {
        logId,
        projectId,
        spaceId,
        deploymentName,
        logs: [{ step, stepStatus, message, timestamp: new Date() }],
        startedAt: new Date(),
      }
    },
    { upsert: true, new: true }
  );
};

export const addLogStep = async ({ logId, step, stepStatus, message }: any) => {
  // Remove any previous log for this step, then push the new one
  await DeploymentLogs.updateOne(
    { logId },
    { $pull: { logs: { step } } }
  );
  return DeploymentLogs.findOneAndUpdate(
    { logId },
    {
      $push: {
        logs: { step, stepStatus, message, timestamp: new Date() }
      }
    },
    { new: true }
  );
};
