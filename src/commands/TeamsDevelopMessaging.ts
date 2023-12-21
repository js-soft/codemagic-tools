import axios from "axios"
import { TeamsCommandLineOptions } from "./TeamsCommandLineOptions"
import { isUrlValid } from "./isUrlValid"

export interface TeamsDevelopMessagingOptions {
  projectName: string
  webhook: string
  artifactUrl: string
  buildUrl: string
  buildWasSuccessful: boolean
  platform: string
  buildNumber: number
}

export class TeamsDevelopMessaging {
  public async run(options: TeamsDevelopMessagingOptions): Promise<void> {
    if (!isUrlValid(options.webhook)) {
      console.error("The given webhook is not valid.")
      process.exit(1)
    }

    if (!isUrlValid(options.artifactUrl)) {
      console.error("The given artifactUrl is not valid.")
      process.exit(1)
    }

    if (!isUrlValid(options.buildUrl)) {
      console.error("The given buildUrl is not valid.")
      process.exit(1)
    }

    const statusIdentifier = options.buildWasSuccessful ? "Successful" : "Failed"
    const platformIdentifier = options.platform.toUpperCase()

    const messageContents = {
      title: `New ${statusIdentifier.toLowerCase()} ${options.platform} debug build for the "${
        options.projectName
      }" App`,
      summary: `${options.projectName}: ${statusIdentifier} build - ${platformIdentifier}`,
      text: options.buildWasSuccessful
        ? `New Build: #${options.buildNumber} - ${platformIdentifier} <br/> The latest version build successfully and is now available as an artifact.`
        : `New Build: #${options.buildNumber} - ${platformIdentifier} <br/> A problem occurred while building the newly released version. The corresponding logs are available.`,
      potentialAction: [
        {
          "@type": "OpenUri",
          name: options.buildWasSuccessful ? `Download ${options.platform}-App` : "Download Flutter Logs",
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

  public extractArguments(
    webhook: string,
    buildWasSuccessful: boolean,
    buildNumber: number,
    projectId: string,
    buildId: string,
    commandLineOptions: TeamsCommandLineOptions,
    cmArtifactLink?: string
  ): TeamsDevelopMessagingOptions {
    if (cmArtifactLink === undefined && buildWasSuccessful) {
      console.log("variable CM_ARTIFACT_LINKS must be present in the system, if the build was successful")
      process.exit(1)
    }

    const teamsDevelopMessagingOptions: TeamsDevelopMessagingOptions = {
      projectName: commandLineOptions.projectName,
      webhook: webhook,
      artifactUrl: buildWasSuccessful ? cmArtifactLink! : `https://codemagic.io/app/${projectId}/build/${buildId}`,
      buildUrl: `https://codemagic.io/app/${projectId}/build/${buildId}`,
      buildWasSuccessful,
      platform: commandLineOptions.platform,
      buildNumber: buildNumber
    }

    return teamsDevelopMessagingOptions
  }
}
