import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import SprintFilters from "../components/sprint/widgets/sprintFilters";
import SprintWidgetGraphStoryPointsTrend from "../components//sprint/widgets/graphStoryPointsTrend";
import SprintWidgetGraphStoryPointsThroughWeek from "../components/sprint/widgets/graphStoryPointsThroughWeek";
import SprintWidgetGraphTagBreakdown from "../components/sprint/widgets/graphTagBreakdown";
import TasksAtRiskWidget from "../components/backlog/alerts/tasksAtRiskWidget";

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
        <Col xs={4} lg={2} className="pb-4">
          <TasksAtRiskWidget />
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="pb-4">
          <SprintFilters sprints={historicSprints} setSprints={setSprints} />
        </Col>
      </Row>
      <Row className="mr-4">
        <Col xs={12} lg={4} style={{ height: "50vh" }}>
          <SprintWidgetGraphStoryPointsTrend sprints={sprintsForDisplay} />
        </Col>
        <Col xs={12} md={6} lg={4} style={{ height: "50vh" }}>
          <SprintWidgetGraphStoryPointsThroughWeek
            sprints={sprintsForDisplay}
          />
        </Col>
        <Col xs={12} md={6} lg={4} style={{ height: "50vh" }}>
          <SprintWidgetGraphTagBreakdown sprints={sprintsForDisplay} />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
