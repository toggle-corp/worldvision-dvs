#!/bin/bash

# /code/scripts/
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# /code/
ROOT_DIR=$(dirname "$BASE_DIR")
BUILD_DIR=${ROOT_DIR}/build

echo "Removing old js/css files"
set -x
rm -rf /build/static/js
rm -rf /build/static/css
set +x

echo "Copying new build files"
cp -rv ${BUILD_DIR}/* /build/
