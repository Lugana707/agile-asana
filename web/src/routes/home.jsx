import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import SprintFilter from "../components/sprint/filter";
import SprintStoryPointsTrend from "../components/sprint/charts/sprintStoryPointsTrend";
import SprintStoryPointPerDay from "../components/sprint/charts/storyPointsPerDay";
import SprintTagsAreaChart from "../components/sprint/charts/sprintTagsAreaChart";
import TasksAtRiskWidget from "../components/backlog/alerts/tasksAtRiskWidget";
import SprintProgressWidget from "../components/sprint/widgets/progress";
import BacklogStoryPoints from "../components/backlog/widgets/storyPoints";
import withSprints from "../components/sprint/withSprints";

const Home = ({ sprints }) => {
  const [filteredSprints, setFilteredSprints] = useState(false);
  const sprintsForDisplay = useMemo(
    () =>
      filteredSprints && filteredSprints.isNotEmpty()
        ? filteredSprints.toArray()
        : [],
    [filteredSprints]
  );

  return (
    <Container fluid>
      <Row className="pb-4">
        <Col xs={4} lg={3}>
          <SprintProgressWidget />
        </Col>
        <Col xs={4} lg={3}>
          <TasksAtRiskWidget />
        </Col>
        <Col xs={4} lg={3}>
          <BacklogStoryPoints />
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="pb-4">
          <SprintFilter sprints={sprints} setSprints={setFilteredSprints} />
        </Col>
      </Row>
      {!sprintsForDisplay.length ? (
        <div className="loading-spinner centre" />
      ) : (
        <Row className="mr-4">
          <Col xs={12} lg={6} style={{ height: "50vh" }}>
            <SprintStoryPointsTrend sprints={sprintsForDisplay} />
          </Col>
          <Col
            xs={12}
            md={{ span: 6, order: 1 }}
            lg={{ span: 6, order: 2 }}
            style={{ height: "50vh" }}
          >
            <SprintStoryPointPerDay sprints={sprintsForDisplay} />
          </Col>
          <Col
            xs={12}
            md={{ span: 6, order: 2 }}
            lg={{ span: 6, order: 1 }}
            style={{ height: "50vh" }}
          >
            <SprintTagsAreaChart sprints={sprintsForDisplay} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default withSprints(Home);
