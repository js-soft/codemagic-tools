import axios from "axios"

export class TeamsMessaging {
  public async main(
    webhook: string,
    platformIdent: string,
    artifactLink: string,
    isSuccessful: boolean
  ): Promise<boolean> {
    if (!this.isSanityCheckUrlsOk([webhook, artifactLink])) {
      console.log("ERROR: A given Url is not a valid url.")
      return false
    }

    let statusIdentifier = "Successful"
    if (!isSuccessful) {
      statusIdentifier = "Failed"
    }

    const messageContents = {
      title: `New ${statusIdentifier.toUpperCase()} codemagic build - ${platformIdent.toUpperCase()}`,
      summary: `${statusIdentifier.toUpperCase()} build - ${platformIdent.toUpperCase()}`,
      text: this.getTextTeamsMsg(isSuccessful),
      potentialAction: [
        {
          "@type": "OpenUri",
          name: "Download Artifact",
          targets: [{ os: "default", uri: artifactLink }]
        }
      ]
    }

    await axios.post(webhook, messageContents)

    return true
  }

  public defineCommandLineOptions(args: any): any {
    return args.option({
      webhook: {
        description: "the webhook of the teams channel, that should receive the message",
        required: true,
        type: "string"
      },
      platform: {
        description: "identifier of the platform for which the build was created [ios/android]",
        required: true,
        type: "string"
      },
      artifactUrl: {
        description: "download link for the generated artifact (logs or build)",
        required: true,
        type: "string"
      },
      wasBuildSuccessful: { description: "status of the finished build", required: true, type: "boolean" }
    })
  }

  private isSanityCheckUrlsOk(urls: string[]): boolean {
    for (const urlToCheck of urls) {
      try {
        // eslint-disable-next-line no-new
        new URL(urlToCheck)
      } catch (err) {
        console.log(err)
        console.log(`Url causing the issue: ${urlToCheck}`)
        return false
      }
    }
    return true
  }

  private getTextTeamsMsg(isSuccessful: boolean) {
    if (isSuccessful) {
      return "The newly released version did build and is now available as an artifact."
    }

    return "The newly released version did NOT build and the logs now available as an artifact."
  }
}
