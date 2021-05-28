import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import SprintFilter from "../components/sprint/filter";
import SprintStoryPointsTrend from "../components/sprint/charts/sprintStoryPointsTrend";
import TasksAtRiskWidget from "../components/backlog/alerts/tasksAtRiskWidget";
import SprintProgressWidget from "../components/sprint/widgets/progress";
import BacklogStoryPoints from "../components/backlog/widgets/storyPoints";
import withSprintsCombined from "../components/sprint/withSprintsCombined";
import SprintBurnDown from "../components/sprint/charts/burnDown";

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

  const Widgets = () => (
    <Row className="mr-4">
      <Col xs={12} lg={12} style={{ height: "50vh" }}>
        <SprintStoryPointsTrend sprints={sprintsCombinedForDisplay} />
      </Col>
      {sprints.where("isCurrentSprint").map(sprint => (
        <Col xs={12} lg={6} key={sprint.uuid}>
          <h4>{sprint.name}</h4>
          <div>
            <SprintBurnDown sprint={sprint} />
          </div>
        </Col>
      ))}
    </Row>
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
        <Widgets />
      )}
    </Container>
  );
};

export default withSprintsCombined(Home);
