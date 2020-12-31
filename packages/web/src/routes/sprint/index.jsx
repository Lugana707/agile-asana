import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import SprintInfoCard from "../../components/sprint/infoCard";
import withSprints from "../../components/sprint/withSprints";

const Sprints = ({ sprints }) => {
  return (
    <Container className="pt-4">
      <Row>
        {sprints.map(sprint => (
          <Col key={sprint.uuid} xs={12} md={6} lg={4} className="pb-4">
            <SprintInfoCard sprint={sprint} showSummary />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default withSprints(Sprints);
