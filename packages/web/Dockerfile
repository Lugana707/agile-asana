# syntax=docker/dockerfile:experimental

FROM node:12-alpine AS base

FROM base AS test

ENV YARN_CACHE_FOLDER=/cache/yarn
ENV NODE_ENV=development

WORKDIR /src
COPY . .
RUN \
  --mount=id=yarn-cache,type=cache,target=/cache/yarn \
  --mount=id=node_modules,type=cache,target=/src/node_modules \
  --mount=type=tmpfs,target=/src/build \
  yarn install --frozen-lockfile --non-interactive && \
  yarn test

FROM test AS build

ENV NODE_ENV=production

RUN \
  --mount=id=yarn-cache,type=cache,target=/cache/yarn \
  --mount=type=tmpfs,target=/src/node_modules \
  --mount=type=tmpfs,target=/src/.cache \
  yarn install --frozen-lockfile --non-interactive && \
  yarn build

FROM scratch AS release

COPY --from=build /src/build /build

FROM amazon/aws-cli:2.0.61 AS deploy

ARG AWS_S3_BUCKET
ARG AWS_DEFAULT_REGION
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

ENV AWS_S3_BUCKET=s3://${AWS_S3_BUCKET}
ENV AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

WORKDIR /build
COPY --from=build /src/build .
RUN aws s3 sync . ${AWS_S3_BUCKET} --acl public-read --follow-symlinks --delete
