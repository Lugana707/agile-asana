import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";
import SprintCardAndTable from "../../../components/sprint/task/sprintCardAndTable";
import SprintJumbotron from "../../../components/sprint/jumbotron";

const Tasks = ({ sprint }) => {
  if (!sprint) {
    return <div />;
  }

  return (
    <>
      <SprintJumbotron sprint={sprint} title="Tasks" />
      <Container fluid>
        <Row>
          <Col xs={12}>
            <SprintCardAndTable sprint={sprint} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withSprintFromURL(Tasks);
