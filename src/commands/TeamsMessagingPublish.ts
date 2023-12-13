import axios from "axios"
import yargs from "yargs"

export interface TeamsMessagingPublishOptions {
  projectName: string
  platform: string
  buildUrl: string
  buildNumber: number
  artifactUrl: string
  webhook: string
}

export class TeamsMessagingPublish {
  public async run(options: TeamsMessagingPublishOptions): Promise<void> {
    if (!this.isUrlValid(options.webhook)) {
      console.error("The given webhook is not valid.")
      process.exit(1)
    }

    if (!this.isUrlValid(options.artifactUrl)) {
      console.error("The given artifactUrl is not valid.")
      process.exit(1)
    }

    const platformIdentifier = options.platform.toUpperCase()
    const storeName = platformIdentifier === "IOS" ? "App Store" : "Google Play Store"
    const messageContents = {
      title: `${options.projectName}: New release is no available in the ${storeName} [${platformIdentifier}]`,
      summary: `New Release - ${platformIdentifier}`,
      text: `New Release ${options.buildNumber} - ${platformIdentifier} <br/> 
      The newly released version is now available in the ${storeName} or can alternatively be directly downloaded below.<br/> `,
      potentialAction: [
        {
          "@type": "OpenUri",
          name: "Download new Version",
          targets: [{ os: "default", uri: options.artifactUrl }]
        },
        {
          "@type": "OpenUri",
          name: "Open Build",
          targets: [{ os: "default", uri: options.artifactUrl }]
        }
      ]
    }

    await axios.post(options.webhook, messageContents).catch((_) => {
      console.log("Could not send message to teams channel.")
      process.exit(1)
    })
  }

  public parseCLIOptions(argv: yargs.Argv<{}>): TeamsMessagingPublishOptions | Promise<TeamsMessagingPublishOptions> {
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
      .option("artifactUrl", {
        description: "download link for the generated artifact (logs or build)",
        required: true,
        type: "string"
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
