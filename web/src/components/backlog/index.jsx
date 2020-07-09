import React from "react";
import { Container, Row, Col, Jumbotron } from "react-bootstrap";
import { useSelector } from "react-redux";
import Table from "../_library/_table";

const Backlog = () => {
  const { loading, refined = [] } = useSelector(state => state.backlogTasks);

  const filteredRefined = refined.filter(({ completed_at }) => !completed_at);

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
      <Jumbotron fluid className="bg-primary">
        <h1>Backlog / Refined</h1>
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
