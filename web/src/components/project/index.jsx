import React, { useEffect } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { loadProjects } from "../../scripts/redux/actions/asana/projectActions";
import { LinkContainer } from "react-router-bootstrap";
import Table from "../_library/_table";

const Projects = () => {
  const { loading, asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (asanaProjectTasks) {
      return;
    }
    dispatch(loadProjects());
  }, [asanaProjectTasks, dispatch]);

  const TableRow = ({ data }) => {
    const { gid, week, completedTasks, totalStoryPoints, archived } = data;
    return (
      <>
        <td>
          <LinkContainer
            to={`/project/${gid}`}
            className={!archived && "text-danger"}
            disabled={!archived}
          >
            <Button variant="link">Week {week}</Button>
          </LinkContainer>
        </td>
        <td>{archived ? totalStoryPoints || "" : "In Progress"}</td>
        <td>{completedTasks.length}</td>
      </>
    );
  };

  if (!asanaProjectTasks) {
    return <div />;
  }

  return (
    <Container>
      <Row>
        <Col>
          <Table loading={loading} data={asanaProjectTasks} row={TableRow} />
        </Col>
      </Row>
    </Container>
  );
};

export default Projects;
