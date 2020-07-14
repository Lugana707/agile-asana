import React, { useEffect, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { loadProjects } from "../../scripts/redux/actions/asana/projectActions";
import Table from "../_library/_table";

const Tasks = ({ match }) => {
  const { loading, asanaProjectTasks, timestamp } = useSelector(
    state => state.asanaProjectTasks
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (asanaProjectTasks) {
      return;
    }
    dispatch(loadProjects());
  }, [asanaProjectTasks, dispatch, timestamp]);

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
