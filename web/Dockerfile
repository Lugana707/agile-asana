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
