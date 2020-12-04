import React, { useMemo, useState } from "react";
import { withRouter } from "react-router-dom";
import { Jumbotron, Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import TasksAtRiskWidget from "../../components/backlog/alerts/tasksAtRiskWidget";
import BacklogProgressPerSprint from "../../components/backlog/charts/progressPerSprint";
import BacklogStoryPoints from "../../components/backlog/widgets/storyPoints";
import SprintFilter from "../../components/sprint/filter";
import TagsFilter from "../../components/library/tags/filter";
import withSprints from "../../components/sprint/withSprints";

const Forecast = ({ sprints, history }) => {
  const [filteredSprints, setFilteredSprints] = useState(false);
  const sprintsForDisplay = useMemo(
    () =>
      filteredSprints && filteredSprints.isNotEmpty()
        ? filteredSprints.toArray()
        : [],
    [filteredSprints]
  );

  const [tags, setTags] = useState([]);

  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Backlog / Dashboard</h1>
          <p hidden>
            <span>Hello backlog dashboard!</span>
          </p>
        </Container>
      </Jumbotron>
      <Container fluid>
        <Row className="pb-4">
          <Col xs={12} md={4} lg={3}>
            <TasksAtRiskWidget />
          </Col>
          <Col xs={12} md={4} lg={3}>
            <BacklogStoryPoints />
          </Col>
          <Col xs={12} md={4} lg={6}>
            <div className="w-100 h-100 bg-warning text-dark rounded pt-4 pb-4">
              <h4 className="mx-auto">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span> Work In Progress!</span>
              </h4>
            </div>
          </Col>
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
          <Col xs={12} className="pb-2">
            <TagsFilter setTags={setTags} />
          </Col>
          <Col xs={12}>
            <BacklogProgressPerSprint
              sprints={sprintsForDisplay}
              weight="storyPoints"
              tags={tags}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withRouter(withSprints(Forecast));
