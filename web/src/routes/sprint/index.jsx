import React from "react";
import { Button, Container, Row, Col, Badge } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Table from "../../components/library/table";
import withCurrentSprint from "../../components/sprint/withCurrentSprint";

const Sprints = ({ currentSprint, sprints }) => {
  const TableRow = ({ data }) => {
    const {
      uuid,
      number,
      storyPoints,
      completedStoryPoints,
      averageCompletedStoryPoints
    } = data;

    const percentageComplete =
      storyPoints === 0
        ? false
        : Math.round((completedStoryPoints / parseFloat(storyPoints)) * 100);

    const inProgress = uuid === currentSprint.uuid;

    return (
      <tr>
        <td className="text-left align-middle">
          <LinkContainer
            to={`/sprint/${uuid}`}
            className={inProgress ? "text-secondary" : ""}
          >
            <Button variant="link">Week {number}</Button>
          </LinkContainer>
        </td>
        <td className="text-center align-middle">{storyPoints}</td>
        <td className="text-center align-middle">
          <span className={inProgress ? "text-secondary" : ""}>
            {completedStoryPoints}
          </span>
        </td>
        {inProgress ? (
          <td colSpan="2" className="text-center align-middle">
            <Badge variant="warning">In Progress</Badge>
          </td>
        ) : (
          <>
            <td className="text-center align-middle">
              {percentageComplete !== false && (
                <span>{percentageComplete}%</span>
              )}
            </td>
            <td className="text-center align-middle">
              {averageCompletedStoryPoints.toString()}
            </td>
          </>
        )}
      </tr>
    );
  };

  const TableHeader = () => {
    return (
      <>
        <th></th>
        <th className="text-center">Committed</th>
        <th className="text-center">Completed</th>
        <th className="text-center" colSpan="2">
          3 Week Average
        </th>
      </>
    );
  };

  return (
    <Container className="pt-4">
      <Row>
        <Col>
          <Table
            id="sprints"
            loading={sprints.isEmpty()}
            data={sprints.all()}
            row={TableRow}
            tableHeader={TableHeader}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default withCurrentSprint(Sprints);
