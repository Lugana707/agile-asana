import React, { useMemo } from "react";
import { Container, Jumbotron, Row, Col } from "react-bootstrap";
import Table from "../../components/library/table";
import collect from "collect.js";
import { useSelector } from "react-redux";

const Report = ({match}) => {
  const { uuid } = match.params;

  const { sprints } = useSelector(state => state.sprints);

  const sprintMemo = useMemo(() => collect(sprints).firstWhere("uuid", uuid), [
    sprints,
    uuid
  ]);

  if (!sprintMemo) {
    return <div className="loading-spinner centre" />;
  }

  const {
    name,
    number,
    tasksCompleted,
    startOn,
    dueOn,
    storyPoints,
    completedStoryPoints,
    averageCompletedStoryPoints,
    state
  } = sprintMemo;
  
  return <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Sprint {number}</h1>
        </Container>
      </Jumbotron>

      <Container>
        <Row>
          <Col>
            <h1>Comparison</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Sprint Breakdown</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <h1>Summary</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>{tasksCompleted.length} Commitments Met</h2>
            <ol>
              {collect(tasksCompleted).dump().where("tags", "!==", []).map(task => (
                <li>
                  {task.name}
                </li>
              ))}
            </ol>
          </Col>
        </Row>
    </Container>
  </>;
};

export default Report;
