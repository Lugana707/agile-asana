import React, { useMemo } from "react";
import { Jumbotron, Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import TasksAtRiskWidget from "../../components/backlog/alerts/tasksAtRiskWidget";
import BacklogProgressPerSprint from "../../components/backlog/charts/progressPerSprint";
import BacklogStoryPoints from "../../components/backlog/widgets/storyPoints";

const Forecast = ({ location }) => {
  const tags = useMemo(
    () => (new URLSearchParams(location.search).get("tags") || "").split("."),
    [location.search]
  );

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
          <Col xs={12} md={4} lg={3}>
            <TasksAtRiskWidget />
          </Col>
          <Col xs={12} md={4} lg={3}>
            <BacklogStoryPoints />
          </Col>
          <Col xs={12} md={4} lg={6}>
            <div className="w-100 h-100 bg-warning text-dark rounded pt-4 pb-4">
              <h4 className="mx-auto">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span> Work In Progress!</span>
              </h4>
            </div>
          </Col>
        </Row>
        <Row className="mr-4 pt-4">
          <Col xs={12}>
            <BacklogProgressPerSprint weight="storyPoints" tags={tags} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Forecast;
