#!/bin/bash

: '
Dependent Environment Variables
 - WV_RC_BRANCH

 - DOCKER_USERNAME
 - DOCKER_PASSWORD
'

docker push devtc/worldvision-dvs:client-latest
docker push devtc/worldvision-dvs:server-latest

echo "************************************************************";
echo "RC Branch=${WV_RC_BRANCH}, Branch=${TRAVIS_BRANCH}, Pull request=${TRAVIS_PULL_REQUEST}"
echo "************************************************************";

# Ignore pull request
if ! [ "${TRAVIS_PULL_REQUEST}" == "false" ]; then
    echo '[Travis Build] Pull request found ... Exiting...'
    exit
fi

# Ignore non RC branch
if ! [ "${TRAVIS_BRANCH}" == "${WV_RC_BRANCH}" ]; then
    echo "Non RC Branch: ${TRAVIS_BRANCH}, current RC branch: ${WV_RC_BRANCH} ...exiting...";
    exit
fi

echo "Detect RC Branch"

docker tag devtc/worldvision-dvs:client-latest devtc/worldvision-dvs:client-release
docker tag devtc/worldvision-dvs:server-latest devtc/worldvision-dvs:server-release

docker push devtc/worldvision-dvs:client-release
docker push devtc/worldvision-dvs:server-release
