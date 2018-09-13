#!/bin/bash


# Build server image
docker build --cache-from devtc/worldvision-dvs:server-latest\
    --tag devtc/worldvision-dvs:server-latest ./server/

# Build client image
docker build --cache-from devtc/worldvision-dvs:client-latest\
    --tag devtc/worldvision-dvs:client-latest ./client/
