#!/bin/bash -x

PYTHON3=${PYTHON3:-python3}

/code/scripts/wait-for-it.sh db:5432
$PYTHON3 manage.py migrate --no-input
$PYTHON3 manage.py runserver 0.0.0.0:8005
