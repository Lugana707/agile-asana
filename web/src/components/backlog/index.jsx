import React from "react";
import { Container, Row, Col, Jumbotron } from "react-bootstrap";
import { useSelector } from "react-redux";
import Table from "../_library/_table";

const Backlog = () => {
  const { loading, refined = [] } = useSelector(state => state.backlogTasks);
  const { asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );

  if (!asanaProjectTasks) {
    return <div />;
  }

  const [currentSprint, previousSprint] = asanaProjectTasks || [];

  const {
    runningAverageCompletedStoryPoints,
    week: currentWeek
  } = previousSprint;

  let index = 0;
  let totalStoryPoints = 0;
  const forecast = refined
    .filter(
      ({ projects }) =>
        !projects.map(({ gid }) => gid).includes(currentSprint.gid)
    )
    .reduce((accumulator, currentValue) => {
      const { storyPoints = 0 } = currentValue;
      totalStoryPoints = totalStoryPoints + storyPoints;

      if (totalStoryPoints >= runningAverageCompletedStoryPoints) {
        index = index + 1;
        totalStoryPoints = storyPoints;
      }

      let tasks = [...accumulator];
      tasks[index] = (accumulator[index] || []).concat([currentValue]);

      return tasks;
    }, []);

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
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Backlog / Refined</h1>
          <p>
            <span>Forecasting with </span>
            <span className="font-weight-bold">
              {runningAverageCompletedStoryPoints} story points
            </span>
            <span> per sprint.</span>
          </p>
        </Container>
      </Jumbotron>
      <Container>
        {forecast.map((tasks, index) => (
          <Row key={index}>
            <Col xs={8} className="text-left">
              <h2>Sprint {index + 1 + currentWeek}</h2>
            </Col>
            <Col xs={4} className="text-right">
              <span className="badge badge-info p-2">
                {tasks.reduce(
                  (accumulator, { storyPoints = 0 }) =>
                    accumulator + storyPoints,
                  0
                )}
              </span>
            </Col>
            <Col xs={12}>
              <hr />
              <Table
                loading={loading}
                data={tasks}
                row={TableRow}
                columns={false}
              />
            </Col>
          </Row>
        ))}
      </Container>
    </>
  );
};

export default Backlog;
