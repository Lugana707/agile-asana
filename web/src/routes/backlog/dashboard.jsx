import React from "react";
import { Jumbotron, Container, Row, Col } from "react-bootstrap";
import TasksAtRiskWidget from "../../components/backlog/alerts/tasksAtRiskWidget";

const Forecast = () => {
  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Backlog / Dashboard</h1>
          <p hidden>
            <span>Hello backlog dashboard!</span>
          </p>
        </Container>
      </Jumbotron>
      <Container fluid>
        <Row>
          <Col xs={4} lg={2}>
            <TasksAtRiskWidget />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Forecast;
