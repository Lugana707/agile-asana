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
    const {
      gid,
      week,
      completedStoryPoints,
      committedStoryPoints,
      runningAverageCompletedStoryPoints,
      archived
    } = data;

    const percentageComplete =
      committedStoryPoints === 0
        ? false
        : Math.round(
            (completedStoryPoints / parseFloat(committedStoryPoints)) * 100
          );

    return (
      <>
        <td className="align-middle">
          <LinkContainer
            to={`/project/${gid}`}
            className={archived ? "" : "text-danger"}
          >
            <Button variant="link">Week {week}</Button>
          </LinkContainer>
        </td>
        <td className="text-center align-middle">{committedStoryPoints}</td>
        {archived ? (
          <>
            <td className="text-center align-middle">
              <span>{completedStoryPoints}</span>
            </td>
            <td className="text-center align-middle">
              {percentageComplete !== false && (
                <span>{percentageComplete}%</span>
              )}
            </td>
            <td className="text-center align-middle">
              {runningAverageCompletedStoryPoints}
            </td>
          </>
        ) : (
          <td colSpan="3" className="text-warning text-center align-middle">
            (In Progress)
          </td>
        )}
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
          <Table
            loading={loading}
            data={asanaProjectTasks}
            row={TableRow}
            columns={["", "Committed", "Completed", "", "3 Week Average"]}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Projects;
