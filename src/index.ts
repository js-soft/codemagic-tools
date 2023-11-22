#!/usr/bin/env node

import yargs from "yargs"
import { TeamsMessaging } from "./commands/TeamsMessaging"
import { EmailMessaging } from "./commands/EmailMessaging"


async function run() {
  await yargs(process.argv.slice(2))
    .command("teams", "This command is used to send a teams message via a passed webhook", async (args) => {
      const teamsMessagingCommand = new TeamsMessaging()
      const options = await teamsMessagingCommand.parseCLIOptions(args)
      await teamsMessagingCommand.run(options)
      return options
    })
    // TODO: work on description string
    .command("email", "This command is used to send a email", async (args) => {
      const emailMessagingCommand = new EmailMessaging()
      const options = await emailMessagingCommand.parseCLIOptions(args)
      await emailMessagingCommand.run(options)
      return options
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
