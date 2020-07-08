import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import Table from "../_library/_table";

const Backlog = () => {
  const { loading, tasks = [] } = useSelector(state => state.backlogTasks);

  const filteredTasks = tasks.filter(obj => !obj.completed_at);

  console.debug("Hello backlog!", { filteredTasks });

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
    <Container>
      <Row>
        <Col>
          <Table
            loading={loading}
            data={filteredTasks}
            row={TableRow}
            //columns={[""]}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Backlog;
