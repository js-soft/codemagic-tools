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


#create a variable and store a json in it
export CM_ARTIFACT_LINKS=$(cat <<EOF
[{"name": "Codemagic_Release.ipa","type": "ipa","url": "https://api.codemagic.io/artifacts/2e7564b2-9ffa-40c2-b9e0-8980436ac717/81c5a723-b162-488a-854e-3f5f7fdfb22f/Codemagic_Release.ipa","md5": "d2884be6985dad3ffc4d6f85b3a3642a","versionName": "1.0.2","bundleId": "io.codemagic.app"},{"name": "logs.txt","type": "txt","url": "https://api.codemagic.io/artifacts/2e7564b2-9ffa-40c2-b9e0-8980436ac717/81c5a723-b162-488a-854e-3f5f7fdfb22f/logs.txt","md5": "d2884be6985dad3ffc4d6f85b3a3642a"}]
EOF
)

echo "webhook url: $teams_webhook_url"

echo "Starting teams messaging tests"
jscm teams-develop --platform "ios" --projectName "Mein Codemagic Test Projekt"
jscm teams-production --platform "ios" --projectName "Mein Codemagic Test Projekt"
touch ~/SUCCESS
jscm teams-develop --platform "ios" --projectName "Mein Codemagic Test Projekt"
jscm teams-production --platform "ios" --projectName "Mein Codemagic Test Projekt"
rm -f ~/SUCCESS
echo "Finished teams messaging tests"