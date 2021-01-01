import pluralise from "pluralise";

const isLoading = state => {
  const { loading: asanaProjectsLoading } = state.asanaProjects;
  const { loading: asanaTasksLoading } = state.asanaTasks;

  return asanaProjectsLoading || asanaTasksLoading;
};

const pluraliseText = ({ name, count }) => {
  const nameLowerCase = name.toLowerCase();

  if (nameLowerCase.endsWith("ed")) {
    return name;
  }

  if (nameLowerCase.endsWith("s") && count !== 1) {
    return `${name}'`;
  }

  return pluralise(count, name);
};

export { isLoading, pluraliseText };
