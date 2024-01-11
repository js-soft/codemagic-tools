import axios from "axios";
import { isUrlValid } from "./isUrlValid";

export interface TeamsProductionMessagingOptions {
  projectName: string;
  platform: string;
  buildUrl: string;
  buildNumber: number;
  webhook: string;
  successfulBuild: boolean;
}

export async function runTeamsProductionMessagingCommand(options: TeamsProductionMessagingOptions): Promise<void> {
  if (!isUrlValid(options.webhook)) {
    console.error("The given webhook is not valid.");
    process.exit(1);
  }

  if (!isUrlValid(options.buildUrl)) {
    console.error("The given buildUrl is not valid.");
    process.exit(1);
  }

  const platformIdentifier = options.platform.toUpperCase();
  const storeName = platformIdentifier === "IOS" ? "App Store" : "Google Play Store";
  const productionMessage = options.successfulBuild
    ? `New release is now available in the ${storeName}`
    : "New release failed to build";

  const messageContents = {
    title: options.successfulBuild
      ? `${options.projectName}: New release is now available in the ${storeName} [${platformIdentifier}]`
      : `${options.projectName}: New release failed to build [${platformIdentifier}]`,
    summary: `New Release - ${platformIdentifier}`,
    text: `New Release: #${options.buildNumber} - ${platformIdentifier} <br/>${productionMessage}`,
    potentialAction: [
      {
        "@type": "OpenUri",
        name: options.successfulBuild ? "Open Build" : "Open Build Logs",
        targets: [{ os: "default", uri: options.buildUrl }]
      }
    ]
  };

  await axios.post(options.webhook, messageContents).catch((_) => {
    console.log("Could not send message to teams channel.");
    process.exit(1);
  });
}
