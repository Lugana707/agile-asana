import { createSelector } from "reselect";
import camelcaseKeys from "camelcase-keys";
import collect from "collect.js";
import moment from "moment";

export const releases = createSelector(
  state => state.githubReleases.data,
  githubReleases =>
    collect(githubReleases)
      .map(release => camelcaseKeys(release, { deep: true, pascalCase: false }))
      .map(({ id, createdAt, publishedAt, ...release }) => ({
        uuid: id,
        createdAt: moment(createdAt),
        publishedAt: publishedAt && moment(publishedAt),
        ...release
      }))
);

export const pullRequests = createSelector(
  state => state.githubPullRequests.data,
  githubPullRequests =>
    collect(githubPullRequests)
      .map(release => camelcaseKeys(release, { deep: true, pascalCase: false }))
      .map(({ id, createdAt, updatedAt, mergedAt, labels, ...release }) => ({
        uuid: id,
        createdAt: moment(createdAt),
        updatedAt: updatedAt && moment(updatedAt),
        mergedAt: mergedAt && moment(mergedAt),
        labels: collect(labels)
          .map(({ color, ...label }) => ({
            color: `#${color}`,
            ...label
          }))
          .sortBy("name"),
        ...release
      }))
);
