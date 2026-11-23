import { defineRailway, project, service } from "railway/iac";
// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "irctc-mcp";
export default defineRailway(() => {
  const irctcMcp = service("irctc-mcp", {
    build: { buildEnvironment: "V3", builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    healthcheck: "/health",
    replicas: { "asia-southeast1-eqsg3a": 1 },
  });

  return project("irctc-mcp", {
    variables: { managed: false },
    resources: [irctcMcp],
  });
});
