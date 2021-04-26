import React, { useMemo, useState } from "react";
import { withRouter } from "react-router-dom";
import { Jumbotron, Container, Row, Col } from "react-bootstrap";
import TasksAtRiskWidget from "../../components/backlog/alerts/tasksAtRiskWidget";
import TasksOverdueWidget from "../../components/backlog/alerts/tasksOverdueWidget";
import BacklogProgressPerSprint from "../../components/backlog/charts/progressPerSprint";
import SprintStoryPointsTrend from "../../components/sprint/charts/sprintStoryPointsTrend";
import BacklogStoryPointsWidget from "../../components/backlog/widgets/storyPoints";
import SprintFilter from "../../components/sprint/filter";
import TagsFilter, {
  withTagsFilterFromURL
} from "../../components/library/tags/filter";
import TaskWeightKeySelector, {
  withTaskWeightKeyFromURL
} from "../../components/library/taskWeightKeySelector";
import withSprintsCombined from "../../components/sprint/withSprintsCombined";

const Forecast = ({ sprintsCombined, history, taskWeightKey, tagsFilter }) => {
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

  return (
    <>
      <Jumbotron fluid>
        <Container>
          <h1>Backlog / Dashboard</h1>
          <p hidden>
            <span>Hello backlog dashboard!</span>
          </p>
        </Container>
      </Jumbotron>
      <Container fluid>
        <Row className="pb-4">
          <TasksAtRiskWidget />
          <TasksOverdueWidget />
          <BacklogStoryPointsWidget />
        </Row>
        <Row className="pb-4">
          <Col xs={12}>
            <SprintFilter
              defaultCount={54}
              sprints={sprintsCombined}
              setSprints={setFilteredSprints}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={{ span: 2, order: 1 }}>
            <TaskWeightKeySelector />
          </Col>
          <Col xs={12} md={{ span: 10, order: 0 }} className="pb-2">
            <TagsFilter />
          </Col>
          <Col
            xs={12}
            md={{ span: 12, order: 2 }}
            lg={6}
            style={{ height: "50vh" }}
          >
            <BacklogProgressPerSprint
              sprints={sprintsCombinedForDisplay}
              weight={taskWeightKey}
              tags={tagsFilter}
            />
          </Col>
          <Col
            xs={12}
            md={{ span: 12, order: 3 }}
            lg={6}
            style={{ height: "50vh" }}
          >
            <SprintStoryPointsTrend sprints={sprintsCombinedForDisplay} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withRouter(
  withTagsFilterFromURL(withTaskWeightKeyFromURL(withSprintsCombined(Forecast)))
);
