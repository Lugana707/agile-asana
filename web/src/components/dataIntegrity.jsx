import React, { useEffect, useState } from "react";
import { useTimeout } from "@react-hook/timeout";
import { withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Logger from "js-logger";
import moment from "moment";
import collect from "collect.js";
import {
  loadAll,
  reloadProject,
  lookForNewProjects
} from "../scripts/redux/actions/asanaActions";
import { processSprints } from "../scripts/redux/actions/sprintActions";
import { loadUser, logout } from "../scripts/redux/actions/settingsActions";

const RELOAD_DATA_TIMEOUT_MINUTES = 5;

const DataIntegrity = ({ history }) => {
  const { loading } = useSelector(state => state.globalReducer);
  const { user, asanaApiKey } = useSelector(state => state.settings);
  const { asanaTags } = useSelector(state => state.asanaTags);
  const { asanaProjects } = useSelector(state => state.asanaProjects);
  const { asanaSections } = useSelector(state => state.asanaSections);
  const { asanaTasks, timestamp: asanaTasksTimestamp } = useSelector(
    state => state.asanaTasks
  );

  const [lastCheckedForData, setLastCheckedForData] = useState(
    moment(asanaTasksTimestamp)
  );

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

  const [timedOut, startTimeout, resetTimeout] = useTimeout(
    RELOAD_DATA_TIMEOUT_MINUTES * 60 * 1000
  );

  useEffect(() => {
    startTimeout();
  }, [startTimeout]);

  useEffect(() => {
    if (loading) {
      return resetTimeout;
    }

    const minutesSinceLastReload = moment().diff(lastCheckedForData, "minutes");
    if (minutesSinceLastReload < RELOAD_DATA_TIMEOUT_MINUTES) {
      return resetTimeout;
    }

    setLastCheckedForData(moment());

    dispatch(
      reloadProject({
        projects: collect(asanaProjects)
          .sortBy(({ created_at }) => moment(created_at).unix())
          .take(2)
      })
    );

    dispatch(lookForNewProjects());

    if (timedOut) {
      return resetTimeout;
    }
  }, [
    timedOut,
    resetTimeout,
    asanaProjects,
    loading,
    dispatch,
    lastCheckedForData
  ]);

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

export default withRouter(DataIntegrity);
