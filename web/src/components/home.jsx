import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import SprintFilters from "./sprint/_widgets/_sprintFilters";
import ProjectWidgetGraphStoryPointsTrend from "./sprint/_widgets/_graphStoryPointsTrend";
import ProjectWidgetGraphStoryPointsThroughWeek from "./sprint/_widgets/_graphStoryPointsThroughWeek";

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
        <Col xs="12" style={{ height: "40vw" }}>
          <ProjectWidgetGraphStoryPointsTrend sprints={sprintsForDisplay} />
        </Col>
        <Col xs="12" style={{ height: "40vw" }}>
          <ProjectWidgetGraphStoryPointsThroughWeek
            sprints={sprintsForDisplay.filter(({ archived }) => !!archived)}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
