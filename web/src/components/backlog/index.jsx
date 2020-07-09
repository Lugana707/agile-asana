import React from "react";
import { Container, Row, Col, Jumbotron } from "react-bootstrap";
import { useSelector } from "react-redux";
import Table from "../_library/_table";

const Backlog = () => {
  const { loading, refined = [] } = useSelector(state => state.backlogTasks);
  const { asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

  const [currentSprint] = asanaProjectTasks || [];

  const filteredRefined = refined.filter(
    ({ projects }) =>
      !projects.map(({ gid }) => gid).includes(currentSprint.gid)
  );

  const TableRow = ({ data }) => {
    const { name, storyPoints } = data;
    return (
      <>
        <td className="align-middle">{name}</td>
        <td className="align-middle text-right">{storyPoints}</td>
      </>
    );
  };

  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Backlog / Refined</h1>
          <p>Hello World!</p>
        </Container>
      </Jumbotron>
      <Container>
        <Row>
          <Col>
            <Table
              loading={loading}
              data={filteredRefined}
              row={TableRow}
              columns={false}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Backlog;
