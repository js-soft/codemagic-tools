import axios from "axios"
import yargs from "yargs"

export interface TeamsProductionMessagingOptions {
  projectName: string
  platform: string
  buildUrl: string
  buildNumber: number
  webhook: string
}

export class TeamsProductionMessaging {
  public async run(options: TeamsProductionMessagingOptions): Promise<void> {
    if (!this.isUrlValid(options.webhook)) {
      console.error("The given webhook is not valid.")
      process.exit(1)
    }

    if (!this.isUrlValid(options.buildUrl)) {
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

  public parseCLIOptions(
    argv: yargs.Argv<{}>
  ): TeamsProductionMessagingOptions | Promise<TeamsProductionMessagingOptions> {
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
      })
      .option("buildUrl", {
        description: "a link to the build page",
        required: true,
        type: "string"
      })
      .option("buildNumber", {
        description: "the number of the run build",
        required: true,
        type: "number"
      })
      .option("webhook", {
        description: "the webhook of the teams channel, that should receive the message",
        required: true,
        type: "string"
      }).argv
  }

  private isUrlValid(url: string): boolean {
    try {
      // eslint-disable-next-line no-new
      new URL(url)
      return true
    } catch (err) {
      return false
    }
  }
}
