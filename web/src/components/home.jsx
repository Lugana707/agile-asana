import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import SprintFilters from "./sprint/_widgets/_sprintFilters";
import SprintWidgetGraphStoryPointsTrend from "./sprint/_widgets/_graphStoryPointsTrend";
import SprintWidgetGraphStoryPointsThroughWeek from "./sprint/_widgets/_graphStoryPointsThroughWeek";
import SprintWidgetGraphTagBreakdown from "./sprint/_widgets/_graphTagBreakdown";
import TasksAtRiskWidget from "./backlog/alerts/_tasksAtRiskWidget";

const Home = () => {
  const state = useSelector(state => state.sprints);

  const historicSprints = useMemo(
    () =>
      collect(state.sprints)
        .where("state", "!==", "FORECAST")
        .sortBy("number")
        .all(),
    [state.sprints]
  );

  const [sprints, setSprints] = useState(historicSprints);
  const sprintsForDisplay = useMemo(
    () => (sprints.length === 0 ? historicSprints : sprints),
    [historicSprints, sprints]
  );

  if (state.loading) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <Container fluid>
      <Row>
        <Col xs={4} className="pb-4">
          <TasksAtRiskWidget />
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="pb-4">
          <SprintFilters sprints={historicSprints} setSprints={setSprints} />
        </Col>
      </Row>
      <Row className="mr-4">
        <Col xs={12} style={{ height: "40vw" }}>
          <SprintWidgetGraphStoryPointsTrend sprints={sprintsForDisplay} />
        </Col>
        <Col xs={12} md={6} style={{ height: "40vw" }}>
          <SprintWidgetGraphStoryPointsThroughWeek
            sprints={sprintsForDisplay}
          />
        </Col>
        <Col xs={12} md={6} style={{ height: "40vw" }}>
          <SprintWidgetGraphTagBreakdown sprints={sprintsForDisplay} />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
