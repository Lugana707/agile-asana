import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Logger from "js-logger";
import { loadAll } from "../../scripts/redux/actions/asanaActions";
import { loadUser } from "../../scripts/redux/actions/settingsActions";
import withLoading from "../withLoading";
import withConfigured from "../withConfigured";

const Asana = ({ history, configured, loading }) => {
  const { user, asanaApiKey } = useSelector(state => state.settings);
  const { data: asanaProjects } = useSelector(state => state.asanaProjects);
  const { data: asanaTasks } = useSelector(state => state.asanaTasks);

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
    if (!configured.asana) {
      history.push("/settings");
    } else if (!user) {
      dispatch(loadUser());
    }
  }, [configured.asana, user, dispatch, history]);

  useEffect(() => {
    if (loading || !configured.asana) {
      return;
    } else if (!asanaProjects || !asanaTasks) {
      dispatch(loadAll());
    }
  }, [loading, configured.asana, dispatch, asanaProjects, asanaTasks]);

  return <div />;
};

export default withRouter(withConfigured(withLoading(Asana)));
