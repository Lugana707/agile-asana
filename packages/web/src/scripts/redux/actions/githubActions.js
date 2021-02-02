import Logger from "js-logger";
import { Octokit } from "@octokit/rest";
import collect from "collect.js";

const createOctokitClient = getState => {
  const { github } = getState().settings;

  return new Octokit({ auth: github.pat });
};

const getAll = async (get, callback, options = {}, maxCount = 1) => {
  const getAllRecursive = async count => {
    const { data } = await get({ ...options, per_page: 100, page: count });

    callback(data);

    if (data.length >= 100 && count < maxCount) {
      await new Promise(resolve => setTimeout(resolve, 250));

      return collect(data)
        .merge(await getAllRecursive(count + 1))
        .toArray();
    }

    return data;
  };

  return await getAllRecursive(1);
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
    } finally {
      dispatch({ type: "FINISHED_LOOKING_FOR_GITHUB_ORGANISATIONS" });
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
    } finally {
      dispatch({ type: "FINISHED_LOOKING_FOR_GITHUB_REPOSITORIES" });
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
        2
      );
    } catch (e) {
      Logger.error(e);
    } finally {
      dispatch({ type: "FINISHED_LOOKING_FOR_GITHUB_PULL_REQUESTS" });
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
    } finally {
      dispatch({ type: "FINISHED_LOOKING_FOR_GITHUB_RELEASES" });
    }
  };
};

export { loadOrganisations, loadRepositories, loadPullRequests, loadReleases };
