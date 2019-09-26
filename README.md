# World Vision DVS
[![Build Status](https://travis-ci.com/toggle-corp/worldvision-dvs.svg?branch=develop)](https://travis-ci.com/toggle-corp/worldvision-dvs)
[![Maintainability](https://api.codeclimate.com/v1/badges/4e2bcf69188cb28301ba/maintainability)](https://codeclimate.com/github/toggle-corp/worldvision-dvs/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4e2bcf69188cb28301ba/test_coverage)](https://codeclimate.com/github/toggle-corp/worldvision-dvs/test_coverage)

### Run
```bash
docker-compose up
```

### Force extract Report
```bash
docker-compose exec server bash -c ". /venv/bin/activate && ./manage.py force_extract_reports"
```
