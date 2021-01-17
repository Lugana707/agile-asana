import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";

export default WrappedComponent => props => {
  const { data: tasks } = useSelector(state => state.tasks);
  const { data: users } = useSelector(state => state.users);

  const usersCollection = useMemo(() => collect(users), [users]);

  const tasksCollectionWithInlineTasks = useMemo(
    () =>
      collect(tasks).map(({ assignee, ...task }) => ({
        assignee: assignee && usersCollection.firstWhere("uuid", assignee),
        ...task
      })),
    [tasks, usersCollection]
  );

  return <WrappedComponent {...props} tasks={tasksCollectionWithInlineTasks} />;
};
