
import { Request, Response } from "express";
import Deployment from "../../models/deployment.schema";

// GET /api/deployment/:deploymentId/summary

export const getDeploymentSummary = async (req: Request, res: Response) => {
  try {
	 const { deploymentId } = req.params;
	 const deployment = await Deployment.findOne({ deploymentId });
	 if (!deployment) {
		return res.status(404).json({ error: "Deployment not found" });
	 }

	 // Find the plan step with structuredData
	 const planStep = deployment.steps.find(
		(s: any) => s.step === "plan" && s.structuredData
	 );

	 const resourcesProvisioned: any[] = [];
	 const resourcesChanged: any[] = [];
	 const resourcesDestroyed: any[] = [];

	 if (planStep?.structuredData?.resource_changes) {
		planStep.structuredData.resource_changes.forEach((rc: any) => {
		  const actions = rc.change?.actions || [];
		  if (actions.includes("create")) {
			 resourcesProvisioned.push({ type: rc.type, name: rc.name, address: rc.address });
		  }
		  if (actions.includes("update")) {
			 resourcesChanged.push({ type: rc.type, name: rc.name, address: rc.address });
		  }
		  if (actions.includes("delete")) {
			 resourcesDestroyed.push({ type: rc.type, name: rc.name, address: rc.address });
		  }
		});
	 }

	 // Optionally, include init/apply/destroy status as before
	 const summary: any = {
		resourcesProvisioned,
		resourcesChanged,
		resourcesDestroyed,
	 };

	 res.json({
		deploymentId: deployment.deploymentId,
		deploymentName: deployment.deploymentName,
		startedAt: deployment.startedAt,
		finishedAt: deployment.finishedAt,
		summary,
		steps: deployment.steps,
	 });
  } catch (err: any) {
	 res.status(500).json({ error: err.message });
  }
};
