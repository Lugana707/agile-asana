import React, { useEffect, useState, useCallback } from "react";
import { useTimeoutCallback } from "@react-hook/timeout";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import {
  reloadProject,
  lookForNewProjects,
  MATCH_PROJECT_BACKLOG
} from "../scripts/redux/actions/asanaActions";
import withLoading from "./withLoading";
import withConfigured from "./withConfigured";

const UpdateProjects = ({
  loading,
  configured,
  seconds: reloadDataTimeoutSeconds
}) => {
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
    if (loading || !configured) {
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
          .merge(
            collect(asanaProjects)
              .filter(({ name }) => MATCH_PROJECT_BACKLOG.test(name))
              .all()
          )
          .where()
      })
    );

    dispatch(lookForNewProjects());
  }, [
    loading,
    configured,
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

export default withConfigured(withLoading(UpdateProjects));
