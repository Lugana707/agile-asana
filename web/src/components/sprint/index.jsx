import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import Table from "../_library/_table";

const Projects = () => {
  const { loading, asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

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
      <tr key={gid}>
        <td className="align-middle">
          <LinkContainer
            to={`/sprint/${gid}`}
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
      </tr>
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
            id="sprints"
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
