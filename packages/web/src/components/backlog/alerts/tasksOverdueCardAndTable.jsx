import React, { useMemo } from "react";
import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import collect from "collect.js";
import SprintCard from "../../sprint/sprintCard";
import withForecastSprints from "../withForecastSprints";
import withTasks from "../../task/withTasks";

const TasksOverdueCardAndTable = ({ hideIfNoData, tasks, forecastSprints }) => {
  const tasksDueSoon = useMemo(
    () =>
      collect(tasks)
        .where("dueOn")
        .where("completedAt", false)
        .filter(({ dueOn }) => dueOn.isBefore(moment()))
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
      <span className="text-dark">
        <FontAwesomeIcon icon={faSkull} />
      </span>
    ),
    storyPoints,
    finishedOn: false,
    tasks: tasksDueSoon
  };

  return (
    <Container fluid>
      <SprintCard
        className="pb-1"
        sprint={sprint}
        variant="danger"
        title={<span className="text-light">Deadlines Missed</span>}
      />
    </Container>
  );
};

export default withForecastSprints(withTasks(TasksOverdueCardAndTable));
