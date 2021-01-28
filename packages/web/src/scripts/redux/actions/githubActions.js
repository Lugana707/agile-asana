import Logger from "js-logger";
import { Octokit } from "@octokit/rest";
import collect from "collect.js";

const createOctokitClient = getState => {
  const { github } = getState().settings;

  return new Octokit({ auth: github.pat });
};

const getAll = async (get, options = {}, count = 0) => {
  const { data } = await get({ ...options, per_page: 100, page: count });

  if (data.length >= 100) {
    return collect(data)
      .merge(await getAll(get, options, count + 1))
      .toArray();
  }

  return data;
};

const loadOrganisations = () => {
  return async (dispatch, getState) => {
    try {
      const { github } = getState().settings;

      if (!github) {
        return false;
      }

      dispatch({ type: "START_LOOKING_FOR_GITHUB_ORGANISATIONS" });

      const octokit = createOctokitClient(getState);

      const data = await getAll(octokit.orgs.listForAuthenticatedUser);

      dispatch({ type: "FOUND_GITHUB_ORGANISATIONS", data });
    } catch (e) {
      Logger.error(e);
    }
  };
};

const loadRepositories = () => {
  return async (dispatch, getState) => {
    try {
      const { github } = getState().settings;
      const { defaultOrganisation } = github || {};

      if (!github || !defaultOrganisation) {
        return false;
      }

      dispatch({ type: "START_LOOKING_FOR_GITHUB_REPOSITORIES" });

      const octokit = createOctokitClient(getState);

      const data = await getAll(octokit.repos.listForOrg, {
        org: defaultOrganisation,
        type: "all",
        sort: "full_name",
        direction: "asc"
      });

      dispatch({ type: "FOUND_GITHUB_REPOSITORIES", data });
    } catch (e) {
      Logger.error(e);
    }
  };
};

const loadPullRequests = () => {
  return async (dispatch, getState) => {
    try {
      const { github } = getState().settings;
      const { defaultOrganisation, defaultRepository } = github || {};

      if (!github || !defaultOrganisation || !defaultRepository) {
        return false;
      }

      dispatch({ type: "START_LOOKING_FOR_GITHUB_PULL_REQUESTS" });

      const octokit = createOctokitClient(getState);

      const data = await getAll(octokit.pulls.list, {
        owner: defaultOrganisation,
        repo: defaultRepository,
        state: "open",
        sort: "created",
        direction: "desc"
      });

      dispatch({ type: "FOUND_GITHUB_PULL_REQUESTS", data });
    } catch (e) {
      Logger.error(e);
    }
  };
};

const loadReleases = () => {
  return async (dispatch, getState) => {
    try {
      const { github } = getState().settings || {};
      const { defaultOrganisation, defaultRepository } = github;

      if (!github || !defaultOrganisation || !defaultRepository) {
        return false;
      }

      dispatch({ type: "START_LOOKING_FOR_GITHUB_RELEASES" });

      const octokit = createOctokitClient(getState);

      const data = await getAll(octokit.repos.listReleases, {
        owner: defaultOrganisation,
        repo: defaultRepository
      });

      dispatch({ type: "FOUND_GITHUB_RELEASES", data });
    } catch (e) {
      Logger.error(e);
    }
  };
};

export { loadOrganisations, loadRepositories, loadPullRequests, loadReleases };
