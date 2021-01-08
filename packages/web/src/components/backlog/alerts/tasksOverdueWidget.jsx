import React, { useMemo } from "react";
import moment from "moment";
import collect from "collect.js";
import Widget from "../../library/widget";
import withTasks from "../../task/withTasks";
import withSprints from "../../sprint/withSprints";

const TasksOverdueCardAndTable = ({ sprints, tasks }) => {
  const tasksDueSoonCount = useMemo(() => {
    const tasksDueSoon = collect(tasks)
      .where("dueOn")
      .where("completedAt", false)
      .filter(({ dueOn }) => dueOn.isBefore(moment()))
      .filter(({ gid, dueOn, projects }) => {
        const sprint = collect(sprints)
          .filter(sprint => collect(sprint.tasks).contains("gid", gid))
          .first();
        if (sprint) {
          return dueOn.isBefore(sprint.finishedOn);
        }
        return true;
      })
      .sortBy("dueOn");

    return tasksDueSoon.count();
  }, [tasks, sprints]);

  return (
    <Widget to="/backlog/forecast" bg="danger" text="dark">
      <h1 className="text-nowrap d-inline">{tasksDueSoonCount}</h1>
      <small className="d-block">deadlines overdue</small>
    </Widget>
  );
};

export default withSprints(withTasks(TasksOverdueCardAndTable));
