import Asana from "asana";
import Logger from "js-logger";
import { loadAll } from "./asanaActions";

const SET_LOADING_SETTINGS = "SET_LOADING_SETTINGS";
const ADD_SETTINGS = "ADD_SETTINGS";
const DELETE_SETTINGS = "DELETE_SETTINGS";

const logout = () => {
  return dispatch => {
    dispatch({
      type: DELETE_SETTINGS,
      loading: false,
      value: "user"
    });
    dispatch({
      type: DELETE_SETTINGS,
      loading: false,
      value: "asanaApiKey"
    });
  };
};

const loadUser = () => {
  return async (dispatch, getState) => {
    const { asanaApiKey } = getState().settings;

    if (!asanaApiKey) {
      Logger.warn("No asanaApiKey! Logging out...");
      dispatch(logout());
      return false;
    }

    try {
      dispatch({ type: SET_LOADING_SETTINGS, loading: true });

      const client = Asana.Client.create().useAccessToken(asanaApiKey);

      const user = await client.users.me();
      const [asanaDefaultWorkspace] = user.workspaces;

      dispatch({
        type: ADD_SETTINGS,
        loading: false,
        value: { user, asanaDefaultWorkspace }
      });
      dispatch(loadAll());
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
    dispatch(loadUser());
  };
};

export { loadUser, logout, updateSettings };
