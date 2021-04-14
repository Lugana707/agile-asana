# syntax=docker/dockerfile:experimental

FROM node:12-alpine AS base

WORKDIR /src

FROM base AS dependencies

ENV YARN_CACHE_FOLDER=/cache/yarn
ENV NODE_ENV=development

COPY package.json yarn.lock .
RUN --mount=id=yarn-cache,type=cache,target=/cache/yarn yarn install --frozen-lockfile --non-interactive

FROM base AS test

ENV NODE_ENV=development
ENV CI=true

COPY . .
RUN \
  --mount=type=cache,target=/src/node_modules,from=dependencies,source=/src/node_modules \
  --mount=type=tmpfs,target=/src/build \
  yarn test

FROM base AS build

ENV NODE_ENV=production

COPY . .
RUN \
  --mount=type=cache,target=/src/node_modules,from=dependencies,source=/src/node_modules \
  --mount=type=tmpfs,target=/src/.cache \
  yarn build

FROM scratch AS release

COPY --from=test /src/coverage /coverage
COPY --from=build /src/build /build
