#!/usr/bin/env node

import fs from "fs"
import yargs from "yargs"
import { CmArtifactLink } from "./CmArtifactLink"
import { TeamsDevelopMessaging } from "./commands/TeamsDevelopMessaging"
import { TeamsProductionMessaging } from "./commands/TeamsProductionMessaging"

async function run() {
  const isSuccess = fs.existsSync("~/SUCCESS")

  const cmArtifactLinks: CmArtifactLink[] = JSON.parse(process.env.CM_ARTIFACT_LINKS!)

  console.log("isSuccess: ", isSuccess)
  console.log("CM_ARTIFACT_LINKS: ", cmArtifactLinks)

  await yargs(process.argv.slice(2))
    .command(
      "teams-develop",
      "After Codemagic Build: Send MS-Teams message informing about the new build",
      async (args) => {
        const teamsMessagingCommand = new TeamsDevelopMessaging()
        const options = await teamsMessagingCommand.parseCLIOptions(args)
        await teamsMessagingCommand.run({
          ...options,
          wasBuildSuccessful: isSuccess,
          cmArtifactLinks
        })
        return options
      }
    )
    .command(
      "teams-production",
      "After Codemagic Publish: Send MS-Teams message informing about the new release",
      async (args) => {
        const teamsMessagePublish = new TeamsProductionMessaging()
        const options = await teamsMessagePublish.parseCLIOptions(args)
        await teamsMessagePublish.run(options)
        return options
      }
    )
    .demand(1, "Must provide a valid command from the ones listed above.")
    .scriptName("jscm")
    .parseAsync()
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
