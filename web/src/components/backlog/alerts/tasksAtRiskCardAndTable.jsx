import React, { useMemo } from "react";
import { Container, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import collect from "collect.js";
import SprintCardAndTable from "../../sprint/task/sprintCardAndTable";
import withForecastSprints from "../withForecastSprints";
import withTasks from "../../task/withTasks";

const TasksAtRiskCardAndTable = ({ hideIfNoData, tasks, forecastSprints }) => {
  const tasksDueSoon = useMemo(
    () =>
      collect(tasks)
        .where("dueOn")
        .where("completedAt", false)
        .filter(({ dueOn }) => dueOn.isBefore(moment().add(14, "days")))
        .filter(({ uuid, dueOn }) => {
          const sprint = forecastSprints
            .filter(({ tasks }) => collect(tasks).contains("uuid", uuid))
            .first();
          if (sprint) {
            return dueOn.isBefore(sprint.completedAt);
          }
          return true;
        })
        .sortBy("dueOn")
        .all(),
    [tasks, forecastSprints]
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
          showSprintCard
        />
      </Row>
    </Container>
  );
};

export default withTasks(withForecastSprints(TasksAtRiskCardAndTable));
