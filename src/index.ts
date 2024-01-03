#!/usr/bin/env node

import fs from "fs";
import yargs from "yargs";
import { CmArtifactLink } from "./CmArtifactLink";
import { TeamsCommandLineOptions } from "./commands/TeamsCommandLineOptions";
import { runTeamsDevelopMessagingCommand } from "./commands/TeamsDevelopMessaging";
import { runTeamsProductionMessagingCommand } from "./commands/TeamsProductionMessaging";

async function run() {
  const buildWasSuccessful = fs.existsSync("~/SUCCESS");

  const webhook = process.env.teams_webhook_url!;
  const buildId = process.env.CM_BUILD_ID!;
  const projectId = process.env.CM_PROJECT_ID!;
  const buildNumber = parseInt(process.env.BUILD_NUMBER!);
  const buildUrl = `https://codemagic.io/app/${projectId}/build/${buildId}`;

  if (process.env.CM_ARTIFACT_LINKS === undefined) {
    console.error(
      "To ensure correct execution the environment variable CM_ARTIFACT_LINKS must be present in the system"
    );
    process.exit(1);
  }

  let artifactUrl: string;
  let artifactType: string;

  const cmArtifactLinks: CmArtifactLink[] = JSON.parse(process.env.CM_ARTIFACT_LINKS!).filter(
    (element: any) => element.type === "apk" || element.type === "ipa"
  );
  if (cmArtifactLinks.filter((element: any) => element.type === "apk" || element.type === "ipa").length !== 0) {
    const pickedElement = cmArtifactLinks.filter((element: any) => element.type === "apk" || element.type === "ipa")[0];
    artifactUrl = pickedElement.url;
    artifactType = pickedElement.type;
  } else {
    // should link to the workflow-log can be determined from buildId and projectId
    artifactUrl = buildUrl;
    artifactType = "logs";
  }

  await yargs(process.argv.slice(2))
    .option("platform", {
      description: "Identifier of the platform for which the build was created",
      required: true,
      type: "string",
      choices: ["ios", "android"]
    })
    .option("projectName", {
      description: "Name of the project",
      required: true,
      type: "string"
    })
    .command(
      "teams-develop",
      "After Codemagic Build: Send MS-Teams message informing about the new build",
      // empty function to avoid yargs internal error
      () => {
        return;
      },
      async (args) => {
        checkArtifactLinkMatchesPlatform(args, artifactType);

        await runTeamsDevelopMessagingCommand({
          projectName: args.projectName,
          webhook,
          artifactUrl,
          buildUrl,
          buildWasSuccessful,
          platform: args.platform,
          buildNumber
        });
      }
    )
    .command(
      "teams-production",
      "After Codemagic Publish: Send MS-Teams message informing about the new release",
      // empty function to avoid yargs internal error
      () => {
        return;
      },
      async (args) =>
        await runTeamsProductionMessagingCommand({
          projectName: args.projectName,
          platform: args.platform,
          buildUrl,
          buildNumber,
          webhook
        })
    )
    .demandCommand(1, "Must provide a valid command from the ones listed above.")
    .scriptName("jscm")
    .parseAsync();
}

function checkArtifactLinkMatchesPlatform(resolvedOptions: TeamsCommandLineOptions, artifactType: string) {
  // throw exception if the artifact link does not have the correct type for the given platform
  if (artifactType === "logs") {
    return;
  }

  if (
    (resolvedOptions.platform === "ios" && artifactType === "apk") ||
    (resolvedOptions.platform === "android" && artifactType === "ipa")
  ) {
    console.log("The artifact link does not have the correct type for the given platform");
    process.exit(1);
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
