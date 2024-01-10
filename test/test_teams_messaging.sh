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

# we want to test the execution without any artifacts present
echo "Testing without the artifactLinks environment variable"
jscm teams-develop --platform "ios" --projectName "Mein Codemagic Test Projekt"
jscm teams-production --platform "ios" --projectName "Mein Codemagic Test Projekt"
echo "Finished teams messaging tests without artifactLinks"

echo "--------------------------------------------"
export CM_ARTIFACT_LINKS=$(cat artifactLinks.json)
echo "created the artifactLinks environment variable"
echo "--------------------------------------------"

echo "Testing with the artifactLinks environment variable"
jscm teams-develop --platform "ios" --projectName "Mein Codemagic Test Projekt"
jscm teams-production --platform "ios" --projectName "Mein Codemagic Test Projekt"
touch ~/SUCCESS
jscm teams-develop --platform "ios" --projectName "Mein Codemagic Test Projekt"
jscm teams-production --platform "ios" --projectName "Mein Codemagic Test Projekt"
rm -f ~/SUCCESS
echo "Finished teams messaging tests"