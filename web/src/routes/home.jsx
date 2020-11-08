import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import collect from "collect.js";
import SprintFilters from "../components/sprint/widgets/sprintFilters";
import SprintWidgetGraphStoryPointsTrend from "../components//sprint/widgets/graphStoryPointsTrend";
import SprintWidgetGraphStoryPointsThroughWeek from "../components/sprint/widgets/graphStoryPointsThroughWeek";
import SprintWidgetGraphTagBreakdown from "../components/sprint/widgets/graphTagBreakdown";
import TasksAtRiskWidget from "../components/backlog/alerts/tasksAtRiskWidget";
import SprintProgressWidget from "../components/sprint/widgets/progress";
import withSprints from "../components/sprint/withSprints";

const Home = ({ sprints }) => {
  const recentSprints = useMemo(
    () =>
      collect(sprints)
        .reverse()
        .take(20)
        .reverse()
        .all(),
    [sprints]
  );

  const [filteredSprints, setFilteredSprints] = useState(recentSprints);
  const sprintsForDisplay = useMemo(
    () => (filteredSprints.length === 0 ? recentSprints : filteredSprints),
    [recentSprints, filteredSprints]
  );

  if (sprints.isEmpty()) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <Container fluid>
      <Row className="pb-4">
        <Col xs={4} lg={2}>
          <SprintProgressWidget />
        </Col>
        <Col xs={4} lg={2}>
          <TasksAtRiskWidget />
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="pb-4">
          <SprintFilters
            sprints={recentSprints}
            setSprints={setFilteredSprints}
          />
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

export default withSprints(Home);
