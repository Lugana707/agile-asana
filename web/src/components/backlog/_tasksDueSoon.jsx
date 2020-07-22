import React, { useMemo } from "react";
import { Row, Col, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import collect from "collect.js";
import moment from "moment";
import Table from "../_library/_table";
import BacklogTableRow from "./_backlogTableRow";

const TasksDueSoon = ({ className, hideIfNoData }) => {
  const { loading, unrefined, refined } = useSelector(
    state => state.backlogTasks
  );
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

  if (tasksDueSoon.length === 0 && hideIfNoData) {
    return <div />;
  }

  return (
    <Row className={`${className} text-left`}>
      <Col xs={8} className="text-danger">
        <h2>Due Soon</h2>
      </Col>
      <Col xs={4} className="text-danger text-right">
        <h2>
          <FontAwesomeIcon icon={faExclamation} />
        </h2>
      </Col>
      <Col xs={12}>
        <Alert variant="danger">
          The following tasks may not be prioritised high in the backlog!
        </Alert>
      </Col>
      <Col xs={12} className="text-left">
        <Table
          id="backlog__tasks-due-soon"
          loading={loading}
          data={tasksDueSoon}
          row={BacklogTableRow}
        />
      </Col>
    </Row>
  );
};

export default TasksDueSoon;
