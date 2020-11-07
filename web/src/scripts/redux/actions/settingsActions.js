import Asana from "asana";
import Logger from "js-logger";

const SET_LOADING_SETTINGS = "SET_LOADING_SETTINGS";
const ADD_SETTINGS = "ADD_SETTINGS";
const DELETE_SETTINGS = "DELETE_SETTINGS";

const loadUser = () => {
  return async (dispatch, getState) => {
    const { asanaApiKey } = getState().settings;

    if (!asanaApiKey) {
      dispatch(logout);
      return false;
    }

    try {
      const client = Asana.Client.create().useAccessToken(asanaApiKey);
      const user = await client.users.me();

      dispatch({ type: ADD_SETTINGS, loading: false, value: { user } });
    } catch (e) {
      dispatch(logout);
      Logger.error(e);
    }
  };
};

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

const updateSettings = ({ settings }) => {
  return dispatch => {
    dispatch({ type: SET_LOADING_SETTINGS, loading: true });
    dispatch({ type: ADD_SETTINGS, loading: false, value: settings });
  };
};

export { loadUser, updateSettings };
