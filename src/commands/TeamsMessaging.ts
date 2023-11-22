import axios from "axios"

export class TeamsMessaging {
  public async main(
    webhook: string,
    platformIdentifier: string,
    artifactLink: string,
    isSuccessful: boolean
  ): Promise<boolean> {
    if (!this.isSanityCheckUrlsOk([webhook, artifactLink])) {
      console.log("ERROR: A given Url is not valid.")
      return false
    }

    const statusIdentifier = isSuccessful ? "Successful" : "Failed"

    const messageContents = {
      title: `New ${statusIdentifier.toUpperCase()} codemagic build - ${platformIdentifier.toUpperCase()}`,
      summary: `${statusIdentifier.toUpperCase()} build - ${platformIdentifier.toUpperCase()}`,
      text: isSuccessful
        ? "The newly released version did build and is now available as an artifact."
        : "A problem occurred while building the newly released version. The corresponding logs are available.",
      potentialAction: [
        {
          "@type": "OpenUri",
          name: isSuccessful ? "Download Build" : "Download Logs",
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
}
