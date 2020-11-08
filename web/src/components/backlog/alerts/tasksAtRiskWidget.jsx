import React, { useMemo } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Card, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";

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
    <LinkContainer to="/backlog/forecast" className="btn p-0">
      <Card bg="danger" text="dark" className="text-left">
        <Card.Body>
          <Card.Title className="m-0">
            <Row>
              <Col xs={4} as="h1" className="text-nowrap">
                {tasksDueSoonCount}
              </Col>
              <Col>Commitments at Risk</Col>
            </Row>
          </Card.Title>
        </Card.Body>
      </Card>
    </LinkContainer>
  );
};

export default TasksAtRiskCardAndTable;
