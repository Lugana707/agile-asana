import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import jsLogger from "js-logger";
import { loadProjects } from "../scripts/redux/actions/asana/projectActions";
import { processProjectTasks } from "../scripts/redux/actions/asana/projectTaskActions";

const DataIntegrity = ({ history }) => {
  const { settings, rawProjectTasks: rawProjectTasksState } = useSelector(
    state => state
  );

  const { asanaApiKey } = settings;
  const { rawProjectTasks = [] } = rawProjectTasksState;

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
    if (!asanaApiKey) {
      history.push("/settings");
      return;
    }
    if (rawProjectTasks) {
      dispatch(processProjectTasks({ rawProjectTasks }));
      return;
    }
    dispatch(loadProjects());
  }, [dispatch, rawProjectTasks, asanaApiKey]);

  return <div />;
};

export default withRouter(DataIntegrity);
