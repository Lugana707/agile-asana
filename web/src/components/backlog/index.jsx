import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import Table from "../_library/_table";

const Backlog = () => {
  const { loading, tasks = [] } = useSelector(state => state.rawBacklogTasks);

  const filteredTasks = tasks.filter(obj => !obj.completed_at);

  const TableRow = ({ data }) => {
    const { name } = data;
    return (
      <>
        <td className="align-middle">{name}</td>
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
