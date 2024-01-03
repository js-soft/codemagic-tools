#!/bin/bash 

#this surely is not the best way to do it, one should use a .enc file which is loaded
echo "Enter a teams_webhook_url: "
read teams_webhook_url_value
export teams_webhook_url=$teams_webhook_url_value

echo "Enter the CM_BUILD_ID : "
read CM_BUILD_ID_VALUE
export CM_BUILD_ID=$CM_BUILD_ID_VALUE

echo "Enter the CM_PROJECT_ID : "
read CM_PROJECT_ID_VALUE
export CM_PROJECT_ID=$CM_PROJECT_ID_VALUE

echo "Enter the BUILD_NUMBER  :"
read BUILD_NUMBER_VALUE
export BUILD_NUMBER=$BUILD_NUMBER_VALUE

export CM_ARTIFACT_LINKS=$(cat artifactLinks.json)

echo "webhook url: $teams_webhook_url"

echo "Starting teams messaging tests"
jscm teams-develop --platform "ios" --projectName "Mein Codemagic Test Projekt"
jscm teams-production --platform "ios" --projectName "Mein Codemagic Test Projekt"
touch ~/SUCCESS
jscm teams-develop --platform "ios" --projectName "Mein Codemagic Test Projekt"
jscm teams-production --platform "ios" --projectName "Mein Codemagic Test Projekt"
rm -f ~/SUCCESS
echo "Finished teams messaging tests"