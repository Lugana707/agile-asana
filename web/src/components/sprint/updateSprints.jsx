import React, { useEffect, useState, useCallback } from "react";
import { useTimeoutCallback } from "@react-hook/timeout";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import {
  reloadProject,
  lookForNewProjects
} from "../../scripts/redux/actions/asanaActions";

const UpdateSprints = ({ seconds: reloadDataTimeoutSeconds }) => {
  const { loading } = useSelector(state => state.globalReducer);
  const { asanaProjects } = useSelector(state => state.asanaProjects);
  const { timestamp: asanaTasksTimestamp } = useSelector(
    state => state.asanaTasks
  );

  const [lastCheckedForData, setLastCheckedForData] = useState(
    moment(asanaTasksTimestamp)
  );

  const dispatch = useDispatch();

  const [timedOut, setTimedOut] = useState(false);

  const reloadAsanaProjectsIfAppropriate = useCallback(() => {
    if (loading) {
      return;
    }

    const secondsSinceLastReload = moment().diff(lastCheckedForData, "seconds");
    if (secondsSinceLastReload < reloadDataTimeoutSeconds) {
      return;
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
  }, [
    loading,
    asanaProjects,
    lastCheckedForData,
    reloadDataTimeoutSeconds,
    dispatch
  ]);

  useEffect(() => reloadAsanaProjectsIfAppropriate(), [
    reloadAsanaProjectsIfAppropriate
  ]);

  const [start] = useTimeoutCallback(() => {
    setTimedOut(true);
    reloadAsanaProjectsIfAppropriate();
  }, 1000);

  useEffect(() => start(), [start]);

  useEffect(() => {
    if (timedOut) {
      setTimedOut(false);
      start();
    }
  }, [timedOut, start]);

  return <div />;
};

export default UpdateSprints;
