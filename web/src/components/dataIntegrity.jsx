import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import jsLogger from "js-logger";
import { loadAll } from "../scripts/redux/actions/asanaActions";
import { processSprints } from "../scripts/redux/actions/sprintActions";

const DataIntegrity = ({ history }) => {
  const { loading } = useSelector(state => state.globalReducer);
  const { asanaApiKey } = useSelector(state => state.settings);
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
    } else if (!asanaTags || !asanaProjects || !asanaSections || !asanaTasks) {
      dispatch(loadAll());
    } else {
      dispatch(processSprints());
    }
  }, [
    loading,
    asanaApiKey,
    history,
    dispatch,
    asanaTags,
    asanaProjects,
    asanaSections,
    asanaTasks
  ]);

  return <div />;
};

export default withRouter(DataIntegrity);
