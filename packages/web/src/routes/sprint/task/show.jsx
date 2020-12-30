import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";
import SprintCardAndTable from "../../../components/sprint/task/sprintCardAndTable";
import SprintJumbotron from "../../../components/sprint/jumbotron";
import TagsFilter, {
  withTagsFilterFromURL
} from "../../../components/library/tags/filter";

const Tasks = ({ sprint, tagsFilter }) => {
  if (!sprint) {
    return <div />;
  }

  return (
    <>
      <SprintJumbotron sprint={sprint} title="Tasks" />
      <Container fluid>
        <Row className="pb-4">
          <Col xs={12}>
            <TagsFilter />
          </Col>
        </Row>
      </Container>
      <Container fluid>
        <Row>
          <Col xs={12}>
            <SprintCardAndTable sprint={sprint} tags={tagsFilter} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withTagsFilterFromURL(withSprintFromURL(Tasks));
