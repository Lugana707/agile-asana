import Asana from "asana";
import Logger from "js-logger";
import { Octokit } from "@octokit/rest";
import collect from "collect.js";

const SET_LOADING_SETTINGS = "SET_LOADING_SETTINGS";
const ADD_SETTINGS = "ADD_SETTINGS";
const DELETE_SETTINGS = "DELETE_SETTINGS";

const logout = key => {
  switch (key) {
    case "github":
      return dispatch =>
        dispatch({
          type: DELETE_SETTINGS,
          loading: false,
          value: "github"
        });

    default:
      return dispatch => {
        ["user", "asanaApiKey", "asanaDefaultWorkspace"].map(value =>
          dispatch({
            type: DELETE_SETTINGS,
            loading: false,
            value
          })
        );

        dispatch({ type: "LOGOUT" });
      };
  }
};

const updateAsanaApiKey = async ({ asanaApiKey }) => {
  const client = Asana.Client.create().useAccessToken(asanaApiKey);

  const user = await client.users.me();

  return { user };
};

const updateGithubPAT = async ({ github }) => {
  if (!github || !github.pat) {
    Logger.warn("No githubPersonalAccessToken! Skipping...");
    return {};
  }

  const octokit = new Octokit({ auth: github.pat });

  const { data: user } = await octokit.request("/user");

  const getOrganisations = async () => {
    if (github.organisations) {
      return github.organisations;
    }

    const {
      data: organisations
    } = await octokit.orgs.listForAuthenticatedUser();

    return collect(organisations)
      .map(org =>
        collect(org)
          .only(["login", "id", "avatar_url"])
          .all()
      )
      .toArray();
  };

  const getRepositories = async () => {
    if (!github.defaultOrganisation) {
      return false;
    }

    if (github.repositories) {
      return github.repositories;
    }

    const { data: repositories } = await octokit.repos.listForOrg({
      org: github.defaultOrganisation.login
    });

    return collect(repositories)
      .dump()
      .map(repo =>
        collect(repo)
          .only(["name", "id", "url"])
          .all()
      )
      .toArray();
  };

  return {
    github: {
      ...github,
      user,
      organisations: await getOrganisations(),
      repositories: await getRepositories()
    }
  };
};

const loadUser = ({ settings }) => {
  return async (dispatch, getState) => {
    const { asanaApiKey, github } = settings || getState().settings;

    if (!asanaApiKey) {
      Logger.warn("No asanaApiKey! Logging out...");
      dispatch(logout());
      return false;
    }

    try {
      dispatch({ type: SET_LOADING_SETTINGS, loading: true });

      const value = {
        ...(await updateAsanaApiKey({ asanaApiKey })),
        ...(await updateGithubPAT({ github }))
      };

      dispatch({
        type: ADD_SETTINGS,
        loading: false,
        value: value
      });
    } catch (error) {
      Logger.error(error);
      dispatch(logout());
    } finally {
      dispatch({ type: SET_LOADING_SETTINGS, loading: false });
    }
  };
};

const updateSettings = ({ settings }) => {
  return dispatch => {
    dispatch({ type: SET_LOADING_SETTINGS, loading: true });
    dispatch({ type: ADD_SETTINGS, loading: false, value: settings });
    dispatch(loadUser({ settings }));
  };
};

export { loadUser, logout, updateSettings };
