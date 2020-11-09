import React from "react";
import { Jumbotron, Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import TasksAtRiskWidget from "../../components/backlog/alerts/tasksAtRiskWidget";
import GraphCountOverTime from "../../components/backlog/widgets/graphCountOverTime";

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
          <Col xs={12} md={4} lg={2}>
            <TasksAtRiskWidget />
          </Col>
          <Col xs={12} md={8} lg={10}>
            <div className="w-100 bg-warning text-dark rounded pt-4 pb-4">
              <h2 className="mx-auto">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span> Work In Progress!</span>
              </h2>
            </div>
          </Col>
        </Row>
        <Row className="mr-4 pt-4">
          <Col style={{ height: "50vh" }}>
            <GraphCountOverTime />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Forecast;
