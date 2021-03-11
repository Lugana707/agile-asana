# syntax=docker/dockerfile:experimental

FROM node:15.3.0-alpine3.12 AS base

WORKDIR /src

FROM base AS test

ENV YARN_CACHE_FOLDER=/cache/yarn
ENV NODE_ENV=development

COPY . .
RUN \
  --mount=id=yarn-cache,type=cache,target=/cache/yarn \
  --mount=id=node_modules,type=cache,target=/src/node_modules \
  yarn ci

FROM test AS build

RUN \
  --mount=id=node_modules,type=cache,target=/src/node_modules \
  yarn build:transpile &&  \
  yarn build:lambda

FROM scratch AS release

COPY --from=build /src /src

FROM base AS deploy

ARG ENVIRONMENT_NAME
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

ENV ENVIRONMENT_NAME=${ENVIRONMENT_NAME}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

COPY --from=build /src .
COPY --from=build /src/bin ./src
RUN \
  --mount=id=node_modules,type=cache,target=/src/node_modules \
  yarn deploy:${ENVIRONMENT_NAME}:lambda
