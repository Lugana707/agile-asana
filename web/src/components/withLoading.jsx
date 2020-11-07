import React, { useMemo } from "react";
import { useSelector } from "react-redux";

export default WrappedComponent => props => {
  const {
    globalReducer,
    asanaProjects,
    asanaSections,
    asanaTasks
  } = useSelector(state => state);

  const { loading: globalLoading } = globalReducer;
  const { loading: asanaProjectsLoading } = asanaProjects;
  const { loading: asanaSectionsLoading } = asanaSections;
  const { loading: asanaTasksLoading } = asanaTasks;

  const loading = useMemo(
    () =>
      globalLoading ||
      asanaProjectsLoading ||
      asanaSectionsLoading ||
      asanaTasksLoading,
    [
      globalLoading,
      asanaProjectsLoading,
      asanaSectionsLoading,
      asanaTasksLoading
    ]
  );

  return <WrappedComponent {...props} loading={loading} />;
};
