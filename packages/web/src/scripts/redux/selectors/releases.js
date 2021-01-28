import { createSelector } from "reselect";
import collect from "collect.js";
import moment from "moment";

export const releases = createSelector(
  state => state.githubReleases.data,
  githubReleases =>
    collect(githubReleases).map(
      ({ id, created_at, published_at, html_url, ...release }) => ({
        uuid: id,
        createdAt: moment(created_at),
        publishedAt: moment(published_at),
        htmlUrl: html_url,
        ...release
      })
    )
);
