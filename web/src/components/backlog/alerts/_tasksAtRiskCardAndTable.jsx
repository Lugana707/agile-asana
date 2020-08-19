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
  const { asanaProjectTasks } = useSelector(state => state.asanaProjectTasks);

  const sprints = useMemo(() => asanaProjectTasks || [], [asanaProjectTasks]);
  const currentSprint = useMemo(() => sprints[0], [sprints]);

  const tasksDueSoon = useMemo(
    () =>
      collect(unrefined || [])
        .concat(refined || [])
        .filter()
        .filter(task => !!task.dueOn)
        .filter(task => task.dueOn.isBefore(moment().add(14, "days")))
        .filter(
          ({ projects }) =>
            !projects.map(({ gid }) => gid).includes(currentSprint.gid)
        )
        .sortBy("dueOn")
        .all(),
    [unrefined, refined, currentSprint.gid]
  );

  const storyPoints = useMemo(() =>
    collect(tasksDueSoon).sum(({ storyPoints = 0 }) => storyPoints)
  );

  if (tasksDueSoon.length === 0 && hideIfNoData) {
    return <div />;
  }

  const sprint = {
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
