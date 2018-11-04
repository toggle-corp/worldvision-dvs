#!/bin/bash

. /venv/bin/activate
/code/scripts/wait-for-it.sh db:5432
# python manage.py test -v 3
py.test --verbosity=3
