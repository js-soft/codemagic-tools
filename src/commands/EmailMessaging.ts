import yargs from "yargs"

export interface EmailMessagingOptions {
  platform: string
  wasBuildSuccessful: boolean
  artifactUrl: string
  senderEmail: string
  receiverEmail: string
  senderEmailKey: string
}

export class EmailMessaging {
  public async run(options: EmailMessagingOptions): Promise<void> {
    
    if (!this.isUrlValid(options.artifactUrl)) {
        console.error("The given artifactUrl is not valid.")
        process.exit(1)
      }

    const statusIdentifier = options.wasBuildSuccessful ? "Successful" : "Failed"
    const platformIdentifier = options.platform.toUpperCase()

    const messageContents = {
      title: `New ${statusIdentifier.toLocaleLowerCase()} codemagic build - ${platformIdentifier}`,
      summary: `${statusIdentifier} build - ${platformIdentifier}`,
      text: options.wasBuildSuccessful
        ? "The newly released version did build and is now available as an artifact."
        : "A problem occurred while building the newly released version. The corresponding logs are available.",
      potentialAction: [
        {
          "@type": "OpenUri",
          name: options.wasBuildSuccessful ? "Download Build" : "Read Logs",
          targets: [{ os: "default", uri: options.artifactUrl }]
        }
      ]
    }
     
    await this.sendEmail(messageContents)
  }

  public sendEmail(messageContents: any):Promise<boolean>{
    // To-Do: work on proper 
    console.log(messageContents)
    return Promise.resolve(true);
  }

  public parseCLIOptions(argv: yargs.Argv<{}>): EmailMessagingOptions | Promise<EmailMessagingOptions> {
    return argv
      .option("platform", {
        description: "identifier of the platform for which the build was created",
        required: true,
        type: "string",
        choices: ["ios", "android"]
      })
      .option("wasBuildSuccessful", {
        description: "status of the finished build",
        required: true,
        type: "boolean"
      })
      .option("artifactUrl", {
        description: "the url of the created artifact either build or logs",
        required: true,
        type: "string"
      }).
      option("senderEmail", {
        description: "the email address from which the email will be send",
        required: true,
        type: "string"
      }).
      option("receiverEmail", {
        description: "the email address which will receive the email",
        required: true,
        type: "string"
      }).
      option("senderEmailKey", {
        description: "secret key used as authentication for the sender email",
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
