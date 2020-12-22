import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Table from "../../components/library/table";
import withSprintFromURL from "../../components/sprint/withSprintFromURL";
import SprintCardAndTable from "../../components/sprint/task/sprintCardAndTable";

const Tasks = ({ sprint }) => {
  if (!sprint) {
    return <div />;
  }

  const { tasks } = sprint;

  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <SprintCardAndTable sprint={sprint} />
        </Col>
      </Row>
    </Container>
  );
};

export default withSprintFromURL(Tasks);
