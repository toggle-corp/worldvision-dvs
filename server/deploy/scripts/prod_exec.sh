#! /bin/bash

# /code/deploy/scripts/
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# /code/
ROOT_DIR=$(dirname "$(dirname "$BASE_DIR")")

. /venv/bin/activate

python3 $ROOT_DIR/manage.py collectstatic --no-input &
python3 $ROOT_DIR/manage.py migrate --no-input

${ROOT_DIR}/scripts/wait-for-it.sh db:5432
uwsgi --ini $ROOT_DIR/deploy/configs/uwsgi.ini # Start uwsgi server
