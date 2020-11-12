import React, { useMemo } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Card, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";

const BacklogStoryPoints = () => {
  const { refinedBacklogTasks } = useSelector(
    state => state.refinedBacklogTasks
  );
  const { unrefinedBacklogTasks } = useSelector(
    state => state.unrefinedBacklogTasks
  );

  const storyPoints = useMemo(() => {
    return collect(unrefinedBacklogTasks || [])
      .merge(refinedBacklogTasks || [])
      .filter()
      .where("storyPoints")
      .sum("storyPoints");
  }, [unrefinedBacklogTasks, refinedBacklogTasks]);

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

export default BacklogStoryPoints;
