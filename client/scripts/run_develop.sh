#!/bin/bash -x

# Copy yarn node_modules from Image
# rsync -a --stats --ignore-existing /node_modules /code/
yarn install
yarn start
