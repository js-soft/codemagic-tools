import axios from "axios"
import yargs from "yargs"

export interface TeamsMessagingOptions {
  webhook: string
  platform: string
  artifactUrl: string
  wasBuildSuccessful: boolean
  buildNumber: number
  buildUrl: string
  appName: string
}

export class TeamsMessaging {
  public async run(options: TeamsMessagingOptions): Promise<void> {
    if (!this.isUrlValid(options.webhook)) {
      console.error("The given webhook is not valid.")
      process.exit(1)
    }

    if (!this.isUrlValid(options.artifactUrl)) {
      console.error("The given artifactUrl is not valid.")
      process.exit(1)
    }

    if (!this.isUrlValid(options.buildUrl)) {
      console.error("The given buildUrl is not valid.")
      process.exit(1)
    }

    const statusIdentifier = options.wasBuildSuccessful ? "Successful" : "Failed"
    const platformIdentifier = options.platform.toUpperCase()

    const messageContents = {
      title: `${options.appName}: New ${statusIdentifier.toLocaleLowerCase()} build ${options.buildNumber} - ${platformIdentifier}`,
      summary: `${options.appName}: ${statusIdentifier} build ${options.buildNumber} - ${platformIdentifier}`,
      text: options.wasBuildSuccessful
        ? `Build ${options.buildNumber}: The newly released version did build and is now available as an artifact.`
        : `Build ${options.buildNumber}: A problem occurred while building the newly released version. The corresponding logs are available.`,
      potentialAction: [
        {
          "@type": "OpenUri",
          name: options.wasBuildSuccessful ? `Download ${options.platform}-App` : "Open Logs",
          targets: [{ os: "default", uri: options.artifactUrl }]
        },
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

  public parseCLIOptions(argv: yargs.Argv<{}>): TeamsMessagingOptions | Promise<TeamsMessagingOptions> {
    return argv
      .option("appName", {
        description: "name of the App",
        required: true,
        type: "string"
      })
      .option("platform", {
        description: "identifier of the platform for which the build was created",
        required: true,
        type: "string",
        choices: ["ios", "android"]
      })
      .option("artifactUrl", {
        description: "download link for the generated artifact (logs or build)",
        required: true,
        type: "string"
      })
      .option("wasBuildSuccessful", {
        description: "status of the finished build",
        required: true,
        type: "boolean"
      })
      .option("webhook", {
        description: "the webhook of the teams channel, that should receive the message",
        required: true,
        type: "string"
      })
      .option("buildNumber", {
        description: "the number of the run build",
        required: true,
        type: "number"
      })
      .option("buildUrl", {
        description: "a link to the build page",
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
