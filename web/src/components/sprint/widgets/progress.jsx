import React, { useMemo } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Card, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import SprintProgress from "../progress";

const TasksAtRiskCardAndTable = () => {
  const { sprints } = useSelector(state => state.sprints);

  const sprint = useMemo(() => collect(sprints).firstWhere("state", "ACTIVE"), [
    sprints
  ]);

  if (!sprint) {
    return <div />;
  }

  const { uuid, number } = sprint;

  return (
    <LinkContainer to={`/sprint/${uuid}`} className="btn p-0">
      <Card bg="secondary" text="light" className="text-left h-100">
        <Card.Body className="p-3">
          <Card.Title className="m-0">
            <div className="pb-1">Sprint {number}</div>
            <SprintProgress sprint={sprint} />
            <Row hidden>
              <Col xs={4} as="h1" className="text-nowrap">
                {number}
              </Col>
              <Col>
                <SprintProgress sprint={sprint} />
              </Col>
            </Row>
          </Card.Title>
        </Card.Body>
      </Card>
    </LinkContainer>
  );
};

export default TasksAtRiskCardAndTable;
