import React, { useMemo } from "react";
import moment from "moment";
import collect from "collect.js";
import Widget from "../../library/widget";
import withTasks from "../../task/withTasks";
import withSprints from "../../sprint/withSprints";

const TasksAtRiskCardAndTable = ({ sprints, tasks }) => {
  const tasksDueSoonCount = useMemo(() => {
    const tasksDueSoon = collect(tasks)
      .where("dueOn")
      .where("completedAt", false)
      .filter(({ dueOn }) => dueOn.isBefore(moment().add(14, "days")))
      .filter(({ dueOn }) => dueOn.isAfter(moment()))
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
    <Widget to="/backlog/forecast" bg="warning" text="dark">
      <h1 className="text-nowrap d-inline">{tasksDueSoonCount}</h1>
      <small className="d-block">deadlines at risk</small>
    </Widget>
  );
};

export default withSprints(withTasks(TasksAtRiskCardAndTable));
