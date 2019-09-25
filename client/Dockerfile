FROM node:10-alpine

MAINTAINER togglecorp info@togglecorp.com

WORKDIR /code

COPY package.json /code/

RUN apk update \
    # App Dependencies
    && apk add --no-cache --virtual .app-deps \
        gawk \
        git \
        rsync \
        bash \
        findutils \
    # Dependencies for yarn install
    && apk add --no-cache --virtual .build-deps \
        python \
        make \
        gcc \
        g++ \
        linux-headers \
    # Install yarn packages
    && mkdir /node_modules/ \
    && ln -sf /node_modules/ /code/node_modules \
    && yarn install \
    # Clear cache
    && apk del --no-cache .build-deps \
    && yarn cache clean

COPY . /code/
