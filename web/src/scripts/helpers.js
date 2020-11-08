const isLoading = state => {
  const { loading: asanaProjectsLoading } = state.asanaProjects;
  const { loading: asanaSectionsLoading } = state.asanaSections;
  const { loading: asanaTasksLoading } = state.asanaTasks;

  return asanaProjectsLoading || asanaSectionsLoading || asanaTasksLoading;
};

export { isLoading };
