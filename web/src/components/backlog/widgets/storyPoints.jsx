import React, { useMemo } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Card, Row, Col } from "react-bootstrap";
import withIncompleteBacklogTasks from "../withIncompleteBacklogTasks";

const BacklogStoryPoints = ({ incompleteBacklogTasks }) => {
  const storyPoints = useMemo(
    () => incompleteBacklogTasks.where("storyPoints").sum("storyPoints"),
    [incompleteBacklogTasks]
  );

  return (
    <LinkContainer to="/backlog/dashboard" className="btn p-0">
      <Card bg="info" text="dark" className="text-left">
        <Card.Body>
          <Card.Title className="m-0">
            <Row>
              <Col xs={4} as="h1" className="text-nowrap">
                {storyPoints}
              </Col>
              <Col>Backlog Story Points</Col>
            </Row>
          </Card.Title>
        </Card.Body>
      </Card>
    </LinkContainer>
  );
};

export default withIncompleteBacklogTasks(BacklogStoryPoints);
