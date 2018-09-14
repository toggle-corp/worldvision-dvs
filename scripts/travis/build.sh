#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" # /code/scripts/travis/
ROOT_DIR=$(dirname "$(dirname "$BASE_DIR")") # /code/

CLIENT_DIR=${ROOT_DIR}/client
VENDOR_DIR=${CLIENT_DIR}/src/vendor
REACT_STORE_DIR=${VENDOR_DIR}/react-store
RAVL_DIR=${VENDOR_DIR}/ravl

mkdir -p ${VENDOR_DIR}

git clone https://github.com/toggle-corp/react-store ${REACT_STORE_DIR}
cp ${REACT_STORE_DIR}/stylesheets/_user-imports-sample.scss ${REACT_STORE_DIR}/stylesheets/_user-imports.scss
git clone https://github.com/toggle-corp/ravl ${RAVL_DIR}

# Build server image
docker build --cache-from devtc/worldvision-dvs:server-latest\
    --tag devtc/worldvision-dvs:server-latest ./server/

# Build client image
docker build --cache-from devtc/worldvision-dvs:client-latest\
    --tag devtc/worldvision-dvs:client-latest ./client/

set -xe;
echo "::::::  >> Generating React Builds"
    python -c "import fcntl; fcntl.fcntl(1, fcntl.F_SETFL, 0)"

    echo "
    REACT_APP_MAPBOX_ACCESS_TOKEN=${REACT_APP_MAPBOX_ACCESS_TOKEN}
    REACT_APP_MAPBOX_STYLE=${REACT_APP_MAPBOX_STYLE}
    " > ${CLIENT_DIR}/.env

    docker run -t -v ${CLIENT_DIR}/build:/code/build --env-file=${CLIENT_DIR}/.env \
        devtc/worldvision-dvs:client-latest bash -c 'yarn install && CI=false yarn build'

    rm ${CLIENT_DIR}/.env
set +xe;
