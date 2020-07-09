import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import jsLogger from "js-logger";
import { loadProjects } from "../scripts/redux/actions/asana/projectActions";
import { reprocessAllTasks } from "../scripts/redux/actions/asana/projectTaskActions";

const DataIntegrity = ({ history }) => {
  const { loading } = useSelector(state => state.globalReducer);
  const { asanaApiKey } = useSelector(state => state.settings);
  const { rawProjectTasks } = useSelector(state => state.rawProjectTasks);
  const { rawBacklogTasks } = useSelector(state => state.rawBacklogTasks);

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
        jsLogger.error(error);
        return Promise.reject(error);
      }
    );
  }, [asanaApiKey]);

  useEffect(() => {
    if (loading) {
      return;
    } else if (!asanaApiKey) {
      history.push("/settings");
    } else if (!rawProjectTasks && !rawBacklogTasks) {
      dispatch(loadProjects());
    } else {
      dispatch(reprocessAllTasks());
    }
  }, [
    loading,
    asanaApiKey,
    history,
    dispatch,
    rawProjectTasks,
    rawBacklogTasks
  ]);

  return <div />;
};

export default withRouter(DataIntegrity);
