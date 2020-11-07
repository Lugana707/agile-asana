import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Logger from "js-logger";
import { loadAll } from "../scripts/redux/actions/asanaActions";
import { processSprints } from "../scripts/redux/actions/sprintActions";
import { loadUser, logout } from "../scripts/redux/actions/settingsActions";
import withLoading from "./withLoading";

const DataIntegrity = ({ history, loading }) => {
  const { user, asanaApiKey } = useSelector(state => state.settings);
  const { asanaTags } = useSelector(state => state.asanaTags);
  const { asanaProjects } = useSelector(state => state.asanaProjects);
  const { asanaSections } = useSelector(state => state.asanaSections);
  const { asanaTasks } = useSelector(state => state.asanaTasks);

  const dispatch = useDispatch();

  useEffect(() => {
    axios.interceptors.request.use(
      ({ headers, ...config }) => {
        return {
          headers: {
            Authorization: `Bearer ${asanaApiKey}`,
            ...headers
          },
          ...config
        };
      },
      error => {
        Logger.error(error);
        return Promise.reject(error);
      }
    );
  }, [asanaApiKey]);

  useEffect(() => {
    if (!asanaApiKey) {
      dispatch(logout());
      history.push("/settings");
    } else if (!user) {
      dispatch(loadUser());
    }
  }, [asanaApiKey, user, dispatch, history]);

  useEffect(() => {
    if (loading || !asanaApiKey) {
      return;
    } else if (!asanaTags || !asanaProjects || !asanaSections || !asanaTasks) {
      dispatch(loadAll());
    } else {
      dispatch(processSprints());
    }
  }, [
    loading,
    asanaApiKey,
    dispatch,
    asanaTags,
    asanaProjects,
    asanaSections,
    asanaTasks
  ]);

  return <div />;
};

export default withRouter(withLoading(DataIntegrity));
