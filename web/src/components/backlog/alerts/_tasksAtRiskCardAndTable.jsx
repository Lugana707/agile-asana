import React, { useMemo } from "react";
import { Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import collect from "collect.js";
import SprintCardAndTable from "../../_library/_sprintCardAndTable";

const TasksAtRiskCardAndTable = ({ hideIfNoData }) => {
  const { unrefinedBacklogTasks } = useSelector(
    state => state.unrefinedBacklogTasks
  );
  const { refinedBacklogTasks } = useSelector(
    state => state.refinedBacklogTasks
  );
  const { sprints } = useSelector(state => state.sprints);

  const tasksDueSoon = useMemo(
    () =>
      collect(unrefinedBacklogTasks || [])
        .merge(refinedBacklogTasks || [])
        .filter()
        .where("dueOn")
        .filter(({ dueOn }) => dueOn.isBefore(moment().add(14, "days")))
        .filter(({ uuid, dueOn }) => {
          const sprint = collect(sprints)
            .where("state", "FORECAST")
            .filter(sprint => collect(sprint.tasks).contains("uuid", uuid))
            .first();
          if (sprint) {
            return dueOn.isBefore(sprint.completedAt);
          }
          return true;
        })
        .sortBy("dueOn")
        .all(),
    [unrefinedBacklogTasks, refinedBacklogTasks, sprints]
  );

  const storyPoints = useMemo(
    () =>
      collect(tasksDueSoon)
        .pluck("storyPoints")
        .filter()
        .sum(),
    [tasksDueSoon]
  );

  if (tasksDueSoon.length === 0 && hideIfNoData) {
    return <div />;
  }

  const sprint = {
    uuid: false,
    number: (
      <span className="text-warning">
        <FontAwesomeIcon icon={faExclamation} />
      </span>
    ),
    storyPoints,
    finishedOn: false,
    tasks: tasksDueSoon
  };

  return (
    <Container fluid>
      <Row className="pb-1">
        <SprintCardAndTable
          sprint={sprint}
          variant="danger"
          title={<span className="text-light">Commitments at Risk</span>}
        />
      </Row>
    </Container>
  );
};

export default TasksAtRiskCardAndTable;
