#!/usr/bin/env node

import yargs from "yargs"
import { TeamsMessaging } from "./commands/TeamsMessaging"

async function run() {
  await yargs(process.argv.slice(2))
    .command("teams", "This command is used to send a teams message via a passed webhook", async (args: any) => {
      const teamsMessagingCommand = new TeamsMessaging()
      args = teamsMessagingCommand.defineCommandLineOptions(args)
      await teamsMessagingCommand.main(
        args.argv.webhook,
        args.argv.platform,
        args.argv.artifactUrl,
        args.argv.wasBuildSuccessful
      )
      return args
    })
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
