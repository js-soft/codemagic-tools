#!/usr/bin/env node

import yargs from "yargs"
import { TeamsMessaging } from "./commands/TeamsMessaging"

const args = require("yargs")
  .usage("jscm command")
  .command("teams", "This command is used to send a teams message via a passed webhook", (args: any) => {
    var teamsMessagingCommand = new TeamsMessaging()
    args = teamsMessagingCommand.defineCommandLineOptions(args)
    teamsMessagingCommand.main(
      args.argv.webhook,
      args.argv.platform,
      args.argv.artifactUrl,
      args.argv.wasBuildSuccessful
    )
    return args
  })
  .demand(1, "Must provide a valid command from the ones listed above.")
  .version("v")
  .alias("v", "version")
  .help("h")
  .alias("h", "help")
  .scriptName("jscm").argv
