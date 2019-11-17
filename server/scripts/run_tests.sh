#!/bin/bash

set -xe
/code/scripts/wait-for-it.sh db:5432

# python manage.py test -v 3
coverage run -m py.test
coverage report -i
coverage html -i
coverage xml -i
