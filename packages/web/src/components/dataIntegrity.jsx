import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Logger from "js-logger";
import { loadAll } from "../scripts/redux/actions/asanaActions";
import { processSprints } from "../scripts/redux/actions/sprintActions";
import { loadUser } from "../scripts/redux/actions/settingsActions";
import withLoading from "./withLoading";
import withConfigured from "./withConfigured";

const DataIntegrity = ({ history, configured, loading }) => {
  const { user, asanaApiKey } = useSelector(state => state.settings);
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
    if (!configured) {
      history.push("/settings");
    } else if (!user) {
      dispatch(loadUser());
    }
  }, [configured, user, dispatch, history]);

  useEffect(() => {
    if (loading || !configured) {
      return;
    } else if (!asanaProjects || !asanaSections || !asanaTasks) {
      dispatch(loadAll());
    } else {
      dispatch(processSprints());
    }
  }, [loading, configured, dispatch, asanaProjects, asanaSections, asanaTasks]);

  return <div />;
};

export default withRouter(withConfigured(withLoading(DataIntegrity)));
