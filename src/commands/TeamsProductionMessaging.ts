import axios from "axios"
import yargs from "yargs"
import { TeamsCommandLineOptions } from "./TeamsCommandLineOptions"
import { isUrlValid } from "./isUrlValid"

export interface TeamsProductionMessagingOptions {
  projectName: string
  platform: string
  buildUrl: string
  buildNumber: number
  webhook: string
}

export class TeamsProductionMessaging {
  public async run(options: TeamsProductionMessagingOptions): Promise<void> {
    if (!isUrlValid(options.webhook)) {
      console.error("The given webhook is not valid.")
      process.exit(1)
    }

    if (!isUrlValid(options.buildUrl)) {
      console.error("The given buildUrl is not valid.")
      process.exit(1)
    }

    const platformIdentifier = options.platform.toUpperCase()
    const storeName = platformIdentifier === "IOS" ? "App Store" : "Google Play Store"
    const messageContents = {
      title: `${options.projectName}: New release is now available in the ${storeName} [${platformIdentifier}]`,
      summary: `New Release - ${platformIdentifier}`,
      text: `New Release: #${options.buildNumber} - ${platformIdentifier} <br/> 
      The newly released version is now available in the ${storeName}. `,
      potentialAction: [
        {
          "@type": "OpenUri",
          name: "Open Build",
          targets: [{ os: "default", uri: options.buildUrl }]
        }
      ]
    }

    await axios.post(options.webhook, messageContents).catch((_) => {
      console.log("Could not send message to teams channel.")
      process.exit(1)
    })
  }

  public parseCLIOptions(argv: yargs.Argv<{}>): TeamsCommandLineOptions | Promise<TeamsCommandLineOptions> {
    return argv
      .option("projectName", {
        description: "Name of the project",
        required: true,
        type: "string"
      })
      .option("platform", {
        description: "identifier of the platform for which the build was created",
        required: true,
        type: "string",
        choices: ["ios", "android"]
      }).argv
  }

  public extractArguments(
    webhook: string,
    buildNumber: number,
    projectId: string,
    buildId: string,
    commandLineOptions: TeamsCommandLineOptions
  ): TeamsProductionMessagingOptions {
    const teamsDevelopMessagingOptions: TeamsProductionMessagingOptions = {
      projectName: commandLineOptions.projectName,
      platform: commandLineOptions.platform,
      buildUrl: `https://codemagic.io/app/${projectId}/build/${buildId}`,
      buildNumber: buildNumber,
      webhook: webhook
    }

    return teamsDevelopMessagingOptions
  }
}
