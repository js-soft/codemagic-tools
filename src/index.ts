#!/usr/bin/env node

import yargs from "yargs"
import { TeamsMessaging } from "./teams/TeamsMessaging"

const args = require("yargs")
  .usage("jscm command")
  .command("teams", "This command is used to send a teams message via a passed webhook", (args: any) => {
    var caller = new TeamsMessaging()
    args = caller.addTeamsCommandArguments(args)
    caller.main(args.argv.webhook, args.argv.platform, args.argv.artifact_url, args.argv.was_build_successful)
    return args
  })
  // <insert options regarding all commands here>  .option('general-option', {description: 'a general option'})
  .demand(1, "Must provide a valid command from the ones listed above.")
  .version("v")
  .alias("v", "version")
  .help("h")
  .alias("h", "help")
  .scriptName("jscm").argv
