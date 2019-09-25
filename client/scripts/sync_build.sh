#!/bin/bash -e

# Copy yarn node_modules from Image
echo "Copy node packages"
rsync -a --stats --ignore-existing /node_modules /code/
yarn start

echo "Building WV App"
CI=false yarn build

echo "Removing old js/css files"
set -x
rm -rf /build/static/js
rm -rf /build/static/css
set +x

echo "Copying new build files"
cp -rv /code/build/* /build/
