import React, { useEffect, useState, useCallback } from "react";
import { useTimeoutCallback } from "@react-hook/timeout";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { reloadRecentProjects } from "../../scripts/redux/actions/asanaActions";
import withLoading from "../withLoading";
import withConfigured from "../withConfigured";

const AsanaTimer = ({
  loading,
  configured,
  seconds: reloadDataTimeoutSeconds
}) => {
  const { timestamp: asanaTasksTimestamp } = useSelector(
    state => state.asanaTasks
  );

  const [lastCheckedForData, setLastCheckedForData] = useState(
    moment(asanaTasksTimestamp)
  );

  const dispatch = useDispatch();

  const [timedOut, setTimedOut] = useState(false);

  const reloadAsanaProjectsIfAppropriate = useCallback(() => {
    if (loading || !configured.asana) {
      return;
    }

    const secondsSinceLastReload = moment().diff(lastCheckedForData, "seconds");
    if (secondsSinceLastReload < reloadDataTimeoutSeconds) {
      return;
    }

    setLastCheckedForData(moment());

    dispatch(reloadRecentProjects());
  }, [
    loading,
    configured.asana,
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

export default withConfigured(withLoading(AsanaTimer));
