import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Card, Row, Col } from "react-bootstrap";
import SprintProgress from "../progress";
import withCurrentSprint from "../withCurrentSprint";

const TasksAtRiskCardAndTable = ({ currentSprint }) => {
  const { uuid, number } = currentSprint;

  return (
    <LinkContainer to={`/sprint/${uuid}`} className="btn p-0">
      <Card bg="secondary" text="light" className="text-left h-100">
        <Card.Body className="p-3">
          <Card.Title className="m-0">
            <div className="pb-1">Sprint {number}</div>
            <SprintProgress sprint={currentSprint} sm />
            <Row hidden>
              <Col xs={4} as="h1" className="text-nowrap">
                {number}
              </Col>
              <Col>
                <SprintProgress sprint={currentSprint} />
              </Col>
            </Row>
          </Card.Title>
        </Card.Body>
      </Card>
    </LinkContainer>
  );
};

export default withCurrentSprint(TasksAtRiskCardAndTable);
