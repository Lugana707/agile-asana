import React, { useMemo } from "react";
import { Container, Jumbotron, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import Forecast from "./_forecast";
import TasksDueSoon from "./_tasksDueSoon";

const Backlog = () => {
  const { asanaProjectTasks = [] } = useSelector(
    state => state.asanaProjectTasks
  );
  const sprints = useMemo(() => asanaProjectTasks || [], [asanaProjectTasks]);

  if (!asanaProjectTasks) {
    return <div />;
  }

  const [{ runningAverageCompletedStoryPoints }] = sprints.filter(
    sprint => sprint.archived
  );

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
        <TasksDueSoon hideIfNoData />
        <Forecast forecastStoryPoints={runningAverageCompletedStoryPoints} />
      </Container>
    </>
  );
};

export default Backlog;
