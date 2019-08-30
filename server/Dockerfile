FROM python:3.7.3-alpine

MAINTAINER togglecorp info@togglecorp.com

ENV PYTHONUNBUFFERED 1
ENV PYTHON3 /usr/bin/python3
ENV PIP3 /usr/bin/pip3

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN apk add --no-cache --virtual .app-deps \
        git bash gcc \
        libxslt libpq coreutils \
        uwsgi-python3 uwsgi-http \
    && apk add --no-cache --virtual .build-deps \
        gcc \
        subversion \
        python3-dev \
        musl-dev \
        postgresql-dev \
        ca-certificates \
        libxml2-dev \
        libxslt-dev \
        zlib-dev \
    && $PIP3 install --upgrade pip \
    && $PIP3 install --no-cache-dir -r requirements.txt \
    && apk del --no-cache .build-deps \
    && printf "alias python3=$PYTHON3\nalias python=$PYTHON3\nalias pip=$PIP3\nalias pip3=$PIP3" >> ~/.bashrc \
    && cp ~/.bashrc ~/.profile

COPY . /code/

CMD ./deploy/scripts/prod_exec.sh
