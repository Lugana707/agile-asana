import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import Table from "../../components/_library/_table";

const Projects = () => {
  const { loading, sprints = [] } = useSelector(state => state.sprints);

  const TableRow = ({ data }) => {
    const {
      uuid,
      number,
      storyPoints,
      completedStoryPoints,
      averageCompletedStoryPoints,
      state
    } = data;

    const percentageComplete =
      storyPoints === 0
        ? false
        : Math.round((completedStoryPoints / parseFloat(storyPoints)) * 100);

    return (
      <tr key={uuid}>
        <td className="align-middle">
          <LinkContainer
            to={`/sprint/${uuid}`}
            className={state === "COMPLETED" ? "" : "text-danger"}
          >
            <Button variant="link">Week {number}</Button>
          </LinkContainer>
        </td>
        <td className="text-center align-middle">{storyPoints}</td>
        {state === "COMPLETED" ? (
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
              {averageCompletedStoryPoints}
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

  if (!sprints) {
    return <div />;
  }

  return (
    <Container>
      <Row>
        <Col>
          <Table
            id="sprints"
            loading={loading}
            data={sprints}
            row={TableRow}
            columns={["", "Committed", "Completed", "", "3 Week Average"]}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Projects;
