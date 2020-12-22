import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import Widget from "../../library/widget";

const TasksAtRiskCardAndTable = () => {
  const { sprints } = useSelector(state => state.sprints);
  const { refinedBacklogTasks } = useSelector(
    state => state.refinedBacklogTasks
  );
  const { unrefinedBacklogTasks } = useSelector(
    state => state.unrefinedBacklogTasks
  );

  const tasksDueSoonCount = useMemo(() => {
    return collect(unrefinedBacklogTasks || [])
      .merge(refinedBacklogTasks || [])
      .filter()
      .where("dueOn")
      .filter(({ dueOn }) => dueOn.isBefore(moment().add(14, "days")))
      .filter(({ gid, dueOn, projects }) => {
        const sprint = collect(sprints)
          .filter(sprint => collect(sprint.tasks).contains("gid", gid))
          .first();
        if (sprint) {
          return dueOn.isBefore(sprint.finishedOn);
        }
        return true;
      })
      .sortBy("dueOn")
      .count();
  }, [unrefinedBacklogTasks, refinedBacklogTasks, sprints]);

  return (
    <Widget to="/backlog/forecast" bg="danger" text="dark">
      <h1 className="text-nowrap d-inline">{tasksDueSoonCount}</h1>
      <small className="d-block">Deadlines at Risk</small>
    </Widget>
  );
};

export default TasksAtRiskCardAndTable;
