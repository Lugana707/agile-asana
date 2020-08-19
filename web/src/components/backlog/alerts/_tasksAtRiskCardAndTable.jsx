import React, { useMemo } from "react";
import { Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import collect from "collect.js";
import SprintCardAndTable from "../../_library/_sprintCardAndTable";

const TasksAtRiskCardAndTable = ({ hideIfNoData }) => {
  const { unrefined, refined } = useSelector(state => state.backlogTasks);
  const { sprints } = useSelector(state => state.sprints);

  const [currentSprint] = useMemo(
    () => sprints.filter(({ state }) => state === "ACTIVE"),
    [sprints]
  );

  const tasksDueSoon = useMemo(
    () =>
      collect(unrefined || [])
        .merge(refined || [])
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
        .all(),
    [unrefined, refined, currentSprint.gid]
  );

  const storyPoints = useMemo(
    () => collect(tasksDueSoon).sum(({ storyPoints = 0 }) => storyPoints),
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
