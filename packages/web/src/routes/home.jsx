import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import SprintFilter from "../components/sprint/filter";
import SprintStoryPointsTrend from "../components/sprint/charts/sprintStoryPointsTrend";
import SprintStoryPointPerDay from "../components/sprint/charts/storyPointsPerDay";
import SprintTagsAreaChart from "../components/sprint/charts/sprintTagsAreaChart";
import TasksAtRiskWidget from "../components/backlog/alerts/tasksAtRiskWidget";
import SprintProgressWidget from "../components/sprint/widgets/progress";
import BacklogStoryPoints from "../components/backlog/widgets/storyPoints";
import withSprintsCombined from "../components/sprint/withSprintsCombined";

const Home = ({ sprints, sprintsCombined }) => {
  const [filteredSprints, setFilteredSprints] = useState(false);

  const sprintsCombinedForDisplay = useMemo(
    () =>
      filteredSprints && filteredSprints.isNotEmpty()
        ? sprintsCombined
            .whereIn("number", filteredSprints.pluck("number").toArray())
            .toArray()
        : [],
    [filteredSprints, sprintsCombined]
  );

  const sprintsForDisplay = useMemo(
    () =>
      filteredSprints && filteredSprints.isNotEmpty()
        ? sprints
            .whereIn("number", filteredSprints.pluck("number").toArray())
            .toArray()
        : [],
    [filteredSprints, sprints]
  );

  return (
    <Container fluid className="pt-4">
      <Row className="pb-4">
        <SprintProgressWidget />
        <TasksAtRiskWidget />
        <BacklogStoryPoints />
      </Row>
      <Row>
        <Col xs={12} className="pb-4">
          <SprintFilter
            defaultCount={20}
            sprints={sprintsCombined}
            setSprints={setFilteredSprints}
          />
        </Col>
      </Row>
      {!sprintsForDisplay.length && !sprintsCombinedForDisplay.length ? (
        <div className="loading-spinner centre" />
      ) : (
        <Row className="mr-4">
          <Col xs={12} lg={12} style={{ height: "50vh" }}>
            <SprintStoryPointsTrend sprints={sprintsCombinedForDisplay} />
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

export default withSprintsCombined(Home);
