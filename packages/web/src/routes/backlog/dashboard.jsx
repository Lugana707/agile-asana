import React, { useMemo, useState } from "react";
import { withRouter } from "react-router-dom";
import { Jumbotron, Container, Row, Col } from "react-bootstrap";
import TasksAtRiskWidget from "../../components/backlog/alerts/tasksAtRiskWidget";
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
import withSprints from "../../components/sprint/withSprints";

const Forecast = ({ sprints, history, taskWeightKey, tagsFilter }) => {
  const [filteredSprints, setFilteredSprints] = useState(false);
  const sprintsForDisplay = useMemo(
    () =>
      filteredSprints && filteredSprints.isNotEmpty()
        ? filteredSprints.toArray()
        : [],
    [filteredSprints]
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
          <BacklogStoryPointsWidget />
        </Row>
        <Row className="pb-4">
          <Col xs={12}>
            <SprintFilter
              defaultCount={54}
              sprints={sprints}
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
              sprints={sprintsForDisplay}
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
            <SprintStoryPointsTrend sprints={sprintsForDisplay} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withRouter(
  withTagsFilterFromURL(withTaskWeightKeyFromURL(withSprints(Forecast)))
);
