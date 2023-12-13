#!/usr/bin/env node

import yargs from "yargs"
import { TeamsMessaging } from "./commands/TeamsMessaging"
import { TeamsMessagingPublish } from "./commands/TeamsMessagingPublish"

async function run() {
  await yargs(process.argv.slice(2))
    .command(
      "teams-build",
      "After Codemagic Build: Send MS-Teams message informing about the new build",
      async (args) => {
        const teamsMessagingCommand = new TeamsMessaging()
        const options = await teamsMessagingCommand.parseCLIOptions(args)
        await teamsMessagingCommand.run(options)
        return options
      }
    )
    .command(
      "teams-publish",
      "After Codemagic Publish: Send MS-Teams message informing about the new release",
      async (args) => {
        const teamsMessagePublish = new TeamsMessagingPublish()
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
