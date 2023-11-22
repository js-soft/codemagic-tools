#!/usr/bin/env node

import yargs from "yargs"
import { TeamsMessaging } from "./commands/TeamsMessaging"

const functionToCall = function (args: any) {
  const teamsMessagingCommand = new TeamsMessaging()
  args = teamsMessagingCommand.defineCommandLineOptions(args)
  const argv = args.argv
  teamsMessagingCommand.main(argv.webhook, argv.platform, argv.artifactUrl, argv.wasBuildSuccessful).then(
    () => {
      // on fulfilled
      console.log("Successful asynchronous execution")
    },
    (x) => {
      // on rejection
      console.log(x)
      throw x
    }
  )
  return args
}

// eslint-disable-next-line no-void
void yargs
  .usage("jscm command")
  .command("teams", "This command is used to send a teams message via a passed webhook", functionToCall)
  .demand(1, "Must provide a valid command from the ones listed above.")
  .scriptName("jscm").argv
