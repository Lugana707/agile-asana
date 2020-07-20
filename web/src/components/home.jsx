import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import SprintFilters from "./sprint/_widgets/_sprintFilters";
import SprintWidgetGraphStoryPointsTrend from "./sprint/_widgets/_graphStoryPointsTrend";
import SprintWidgetGraphStoryPointsThroughWeek from "./sprint/_widgets/_graphStoryPointsThroughWeek";
import SprintWidgetGraphTagBreakdown from "./sprint/_widgets/_graphTagBreakdown";

const Home = () => {
  const { loading, asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

  const projectTasks = useMemo(() => asanaProjectTasks || [], [
    asanaProjectTasks
  ]);

  const [sprints, setSprints] = useState(projectTasks);
  const sprintsForDisplay = useMemo(
    () => (sprints.length === 0 ? projectTasks : sprints),
    [projectTasks, sprints]
  );

  if (loading) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <Container className="">
      <Row>
        <Col xs={12} className="pb-4">
          <SprintFilters sprints={projectTasks} setSprints={setSprints} />
        </Col>
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
