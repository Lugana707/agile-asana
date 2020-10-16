import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import moment from "moment";
import Table from "../../components/_library/_table";

const Tasks = ({ match }) => {
  const { loading, asanaProjectTasks } = useSelector(
    state => state.asanaProjectTasks
  );

  const { projectGid } = match.params;
  const projectGidMemo = useMemo(() => decodeURIComponent(projectGid), [
    projectGid
  ]);

  const TableRow = ({ data }) => {
    const { name, completed_at, "Story Points": storyPoints } = data;
    return (
      <>
        <td>{name}</td>
        <td>{storyPoints}</td>
        <td>{completed_at && moment(completed_at).format("LLL")}</td>
      </>
    );
  };

  if (!asanaProjectTasks) {
    return <div />;
  }

  const { completedTasks } = asanaProjectTasks.find(
    obj => obj.gid === projectGidMemo
  );

  return (
    <Container>
      <Row>
        <Col>
          <Table
            id={asanaProjectTasks.name}
            loading={loading}
            data={completedTasks}
            row={TableRow}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Tasks;
