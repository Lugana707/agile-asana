import Logger from "js-logger";
import { Octokit } from "@octokit/rest";

const createOctokitClient = getState => {
  const { github } = getState().settings;

  return new Octokit({ auth: github.pat });
};

const getAll = async (get, callback, options = {}, maxCount = 1) => {
  return await Promise.all(
    new Array(maxCount).fill(0).map(async (obj, index) => {
      const { data } = await get({ ...options, per_page: 100, page: index });

      callback(data);

      return data;
    })
  );
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

      await getAll(octokit.orgs.listForAuthenticatedUser, data =>
        dispatch({ type: "FOUND_GITHUB_ORGANISATIONS", data })
      );
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

      await getAll(
        octokit.repos.listForOrg,
        data => dispatch({ type: "FOUND_GITHUB_REPOSITORIES", data }),
        {
          org: defaultOrganisation,
          type: "all",
          sort: "full_name",
          direction: "asc"
        }
      );
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

      await getAll(
        octokit.pulls.list,
        data => dispatch({ type: "FOUND_GITHUB_PULL_REQUESTS", data }),
        {
          owner: defaultOrganisation,
          repo: defaultRepository,
          state: "all",
          sort: "created",
          direction: "desc"
        },
        10
      );
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

      await getAll(
        octokit.repos.listReleases,
        data => dispatch({ type: "FOUND_GITHUB_RELEASES", data }),
        {
          owner: defaultOrganisation,
          repo: defaultRepository
        }
      );
    } catch (e) {
      Logger.error(e);
    }
  };
};

export { loadOrganisations, loadRepositories, loadPullRequests, loadReleases };
