#!/usr/bin/env node

import fs from "fs"
import yargs from "yargs"
import { CmArtifactLink } from "./CmArtifactLink"
import { TeamsDevelopMessaging } from "./commands/TeamsDevelopMessaging"
import { TeamsProductionMessaging } from "./commands/TeamsProductionMessaging"
import { TeamsCommandLineOptions } from "./commands/TeamsCommandLineOptions"

async function run() {
  const buildWasSuccessful = fs.existsSync("~/SUCCESS")

  const webhook = process.env.teams_webhook_url!
  const buildId = process.env.CM_BUILD_ID!
  const projectId = process.env.CM_PROJECT_ID!
  const buildNumber = process.env.BUILD_NUMBER!

  let cmArtifactLink: string
  try {
    const cmArtifactLinks: CmArtifactLink[] = JSON.parse(process.env.CM_ARTIFACT_LINKS!).filter(
      (element: any) => element.type === "apk" || element.type === "ipa"
    )
    let artifactLink: string
    if (cmArtifactLinks.filter((element: any) => element.type === "apk" || element.type === "ipa").length !== 0) {
      artifactLink = cmArtifactLinks.filter((element: any) => element.type === "apk" || element.type === "ipa")[0].url
    } else {
      // should link to the workflow-log can be determined from buildId and projectId
      artifactLink = `https://codemagic.io/app/${projectId}/build/${buildId}`
    }
    cmArtifactLink = artifactLink
  } catch (error) {
    console.log(error)
    console.log("To ensure correct execution the environment variable CM_ARTIFACT_LINKS must be present in the system")
    process.exit(1)
  }

  await yargs(process.argv.slice(2))
    .command(
      "teams-develop",
      "After Codemagic Build: Send MS-Teams message informing about the new build",
      async () => {
        const teamsMessagingCommand = new TeamsDevelopMessaging()
        const unresolvedOptions = parseCLIOptionsTeams(yargs)
        const resolvedOptions: { platform: string; projectName: string } =
          unresolvedOptions instanceof Promise ? await unresolvedOptions : unresolvedOptions
        checkArtifactLinkMatchesPlatform(resolvedOptions, cmArtifactLink)

        const parameters = teamsMessagingCommand.extractArguments(
          webhook,
          buildWasSuccessful,
          Number(buildNumber),
          projectId,
          buildId,
          resolvedOptions,
          cmArtifactLink
        )
        await teamsMessagingCommand.run(parameters)
        return
      }
    )
    .command(
      "teams-production",
      "After Codemagic Publish: Send MS-Teams message informing about the new release",
      async () => {
        const teamsMessagePublish = new TeamsProductionMessaging()
        const unresolvedOptions = parseCLIOptionsTeams(yargs)
        const resolvedOptions: { platform: string; projectName: string } =
          unresolvedOptions instanceof Promise ? await unresolvedOptions : unresolvedOptions
        checkArtifactLinkMatchesPlatform(resolvedOptions, cmArtifactLink)

        const options = teamsMessagePublish.extractArguments(
          webhook,
          Number(buildNumber),
          projectId,
          buildId,
          resolvedOptions
        )
        await teamsMessagePublish.run(options)
        return resolvedOptions
      }
    )
    .demand(1, "Must provide a valid command from the ones listed above.")
    .scriptName("jscm")
    .parseAsync()
}

function parseCLIOptionsTeams(argv: yargs.Argv<{}>): TeamsCommandLineOptions | Promise<TeamsCommandLineOptions> {
  return argv
    .option("platform", {
      description: "identifier of the platform for which the build was created",
      required: true,
      type: "string",
      choices: ["ios", "android"]
    })
    .option("projectName", {
      description: "objectIdentifier",
      required: true,
      type: "string"
    }).argv
}

function checkArtifactLinkMatchesPlatform(resolvedOptions: TeamsCommandLineOptions, cmArtifactLink: string) {
  // throw exception if the artifact link does not have the correct type for the given platform
  if (
    (resolvedOptions.platform === "ios" && cmArtifactLink.includes("ipa")!) ||
    (resolvedOptions.platform === "android" && cmArtifactLink.includes("apk")!)
  ) {
    console.log("The artifact link does not have the correct type for the given platform")
    process.exit(1)
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
