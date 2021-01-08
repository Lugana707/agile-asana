import React, { useMemo } from "react";
import TaskSearchableList from "../../components/task/searchableList";
import withTasks from "../../components/task/withTasks";

const Sprints = ({ tasks }) => {
  const sortedTasks = useMemo(
    () => tasks.sortByDesc(({ createdAt }) => createdAt.unix()),
    [tasks]
  );

  return (
    <>
      <div className="pt-4" />
      <TaskSearchableList tasks={sortedTasks} />
    </>
  );
};

export default withTasks(Sprints);
