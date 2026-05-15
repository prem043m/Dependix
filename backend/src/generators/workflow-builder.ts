import { dockerTemplate } from "./templates/docker.template";
import { nodeTemplate } from "./templates/node.template";
import { pythonTemplate } from "./templates/python.template";

export type PipelineGenerationInput = {
  language: string | null;
  framework: string | null;
  packageManager: string | null;
  hasDocker: boolean;
  defaultBranch?: string | null;
};

type WorkflowDefinition = {
  name: string;
  on: {
    push: {
      branches: string[];
    };
    pull_request?: {
      branches: string[];
    };
  };
  jobs: Record<string, unknown>;
};

function genericTemplate(branch: string): WorkflowDefinition {
  return {
    name: "Generic CI",
    on: {
      push: {
        branches: [branch],
      },
    },
    jobs: {
      build: {
        "runs-on": "ubuntu-latest",
        steps: [
          {
            uses: "actions/checkout@v4",
          },
          {
            run: "echo \"Add project-specific build steps here\"",
          },
        ],
      },
    },
  };
}

function withBranch(
  workflow: WorkflowDefinition,
  branch: string
): WorkflowDefinition {
  return {
    ...workflow,
    on: {
      ...workflow.on,
      push: {
        branches: [branch],
      },
      ...(workflow.on.pull_request
        ? {
            pull_request: {
              branches: [branch],
            },
          }
        : {}),
    },
  };
}

export function buildWorkflow(
  input: PipelineGenerationInput
): WorkflowDefinition {
  const branch = input.defaultBranch?.trim() || "main";

  let workflow: WorkflowDefinition;

  switch (input.language) {
    case "Node.js":
      workflow = withBranch(nodeTemplate(), branch);
      break;
    case "Python":
      workflow = withBranch(pythonTemplate(), branch);
      break;
    default:
      workflow = genericTemplate(branch);
      break;
  }

  if (input.hasDocker) {
    workflow = {
      ...workflow,
      jobs: {
        ...workflow.jobs,
        ...dockerTemplate().jobs,
      },
    };
  }

  return workflow;
}
