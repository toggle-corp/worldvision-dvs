#! /bin/bash

PYTHON3=${PYTHON3:-python3}

$PYTHON3 /code/manage.py collectstatic --no-input &
$PYTHON3 /code/manage.py migrate --no-input

/code/scripts/wait-for-it.sh ${DATABASE_HOST:-db}:${DATABASE_PORT:-5432}
uwsgi --ini /code/deploy/configs/uwsgi.ini # Start uwsgi wv_dvs
