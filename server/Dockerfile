FROM python:3.7.3-alpine

MAINTAINER togglecorp info@togglecorp.com

ENV PYTHONUNBUFFERED 1
ENV PYTHON3 /usr/local/bin/python3
ENV PIP3 /usr/local/bin/pip3

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN apk add --no-cache --virtual .app-deps \
        git bash gcc libxslt libpq coreutils \
    && apk add --no-cache --virtual .build-deps \
        subversion \
        python3-dev \
        musl-dev \
        linux-headers \
        postgresql-dev \
        ca-certificates \
        libxml2-dev \
        libxslt-dev \
        zlib-dev \
    && $PIP3 install --upgrade pip \
    && $PIP3 install --no-cache-dir -r requirements.txt \
    && apk del --no-cache .build-deps

COPY . /code/

CMD ./deploy/scripts/prod_exec.sh
