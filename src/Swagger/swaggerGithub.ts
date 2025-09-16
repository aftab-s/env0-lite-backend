
/**
 * OpenAPI definitions for GitHub PAT endpoints
 */

export const githubPatPaths = {
	"/api/github/pat": {
		post: {
			summary: "Save a GitHub Personal Access Token (PAT) for a user",
			tags: ["GitHub PAT"],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: {
							type: "object",
							required: ["email", "pat"],
							properties: {
								email: { type: "string", example: "user@example.com" },
								pat: { type: "string", example: "ghp_1234567890abcdef" },
							},
						},
					},
				},
			},
			responses: {
				200: {
					description: "PAT saved",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									message: { type: "string" },
								},
							},
						},
					},
				},
				400: { description: "Email and PAT required" },
				500: { description: "Failed to save PAT" },
			},
		},
	},
	"/api/github/repos/{email}": {
		get: {
			summary: "Get GitHub repositories for a user",
			tags: ["GitHub PAT"],
			parameters: [
				{
					in: "path",
					name: "email",
					schema: { type: "string" },
					required: true,
					description: "User's email",
				},
			],
			responses: {
				200: {
					description: "List of repository names",
					content: {
						"application/json": {
							schema: {
								type: "array",
								items: { type: "string" },
							},
						},
					},
				},
				401: { description: "Invalid or unauthorized PAT" },
				404: { description: "PAT not found for user" },
				500: { description: "Failed to fetch repos" },
			},
		},
	},
	"/api/github/contents/{email}/{owner}/{repo}/*": {
		get: {
			summary: "Get contents of a GitHub repository for a user",
			tags: ["GitHub PAT"],
			parameters: [
				{
					in: "path",
					name: "email",
					schema: { type: "string" },
					required: true,
					description: "User's email",
				},
				{
					in: "path",
					name: "owner",
					schema: { type: "string" },
					required: true,
					description: "Repository owner",
				},
				{
					in: "path",
					name: "repo",
					schema: { type: "string" },
					required: true,
					description: "Repository name",
				},
				{
					in: "path",
					name: "0",
					schema: { type: "string" },
					required: false,
					description: "Path inside the repository (optional)",
				},
			],
			responses: {
				200: {
					description: "Repository contents",
					content: {
						"application/json": {
							schema: {
								type: "array",
								items: { type: "object" },
							},
						},
					},
				},
				401: { description: "Invalid or unauthorized PAT" },
				404: { description: "Repo or path not found" },
				500: { description: "Failed to fetch repo contents" },
			},
		},
	},
};
