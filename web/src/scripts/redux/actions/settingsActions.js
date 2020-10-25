import asana from "asana";

const SET_LOADING_SETTINGS = "SET_LOADING_SETTINGS";
const ADD_SETTINGS = "ADD_SETTINGS";

const loadUser = () => {
  return async (dispatch, getState) => {
    const { asanaApiKey } = getState().settings;

    const client = asana.Client.create().useAccessToken(asanaApiKey);
    const user = await client.users.me();

    dispatch({ type: ADD_SETTINGS, loading: false, value: { user } });
  };
};

const updateSettings = ({ settings }) => {
  return dispatch => {
    dispatch({ type: SET_LOADING_SETTINGS, loading: true });
    dispatch({ type: ADD_SETTINGS, loading: false, value: settings });
  };
};

export { loadUser, updateSettings };
