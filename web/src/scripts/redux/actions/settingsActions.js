import Asana from "asana";
import Logger from "js-logger";

const SET_LOADING_SETTINGS = "SET_LOADING_SETTINGS";
const ADD_SETTINGS = "ADD_SETTINGS";
const DELETE_SETTINGS = "DELETE_SETTINGS";

const logout = () => {
  return dispatch => {
    ["user", "asanaApiKey", "asanaDefaultWorkspace"].map(value =>
      dispatch({
        type: DELETE_SETTINGS,
        loading: false,
        value
      })
    );
  };
};

const loadUser = ({ settings }) => {
  return async (dispatch, getState) => {
    const { asanaApiKey } = settings || getState().settings;

    if (!asanaApiKey) {
      Logger.warn("No asanaApiKey! Logging out...");
      dispatch(logout());
      return false;
    }

    try {
      dispatch({ type: SET_LOADING_SETTINGS, loading: true });

      const client = Asana.Client.create().useAccessToken(asanaApiKey);

      const user = await client.users.me();

      dispatch({
        type: ADD_SETTINGS,
        loading: false,
        value: { user }
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
