import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import collect from "collect.js";
import SprintFilters from "../components/sprint/widgets/sprintFilters";
import SprintWidgetGraphStoryPointsTrend from "../components//sprint/widgets/graphStoryPointsTrend";
import SprintWidgetGraphStoryPointsThroughSprint from "../components/sprint/widgets/graphStoryPointsThroughSprint";
import SprintWidgetGraphTagBreakdown from "../components/sprint/widgets/graphTagBreakdown";
import TasksAtRiskWidget from "../components/backlog/alerts/tasksAtRiskWidget";
import SprintProgressWidget from "../components/sprint/widgets/progress";
import BacklogStoryPoints from "../components/backlog/widgets/storyPoints";
import withSprints from "../components/sprint/withSprints";

const Home = ({ sprints }) => {
  const recentSprints = useMemo(
    () =>
      collect(sprints)
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
          <SprintFilters
            sprints={recentSprints}
            setSprints={setFilteredSprints}
          />
        </Col>
      </Row>
      <Row className="mr-4">
        <Col xs={12} lg={6} style={{ height: "50vh" }}>
          <SprintWidgetGraphStoryPointsTrend sprints={sprintsForDisplay} />
        </Col>
        <Col
          xs={12}
          md={{ span: 6, order: 1 }}
          lg={{ span: 6, order: 2 }}
          style={{ height: "50vh" }}
        >
          <SprintWidgetGraphStoryPointsThroughSprint
            sprints={sprintsForDisplay}
          />
        </Col>
        <Col
          xs={12}
          md={{ span: 6, order: 2 }}
          lg={{ span: 6, order: 1 }}
          style={{ height: "50vh" }}
        >
          <SprintWidgetGraphTagBreakdown sprints={sprintsForDisplay} />
        </Col>
      </Row>
    </Container>
  );
};

export default withSprints(Home);
