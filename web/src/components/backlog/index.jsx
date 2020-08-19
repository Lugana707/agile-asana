import React, { useMemo } from "react";
import { Container, Jumbotron } from "react-bootstrap";
import { useSelector } from "react-redux";
import ForecastGrid from "./forecast/grid";
import TasksDueSoon from "./alerts/tasksDueSoon";
import AlertsGrid from "./alerts/grid";

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
      <Container fluid hidden>
        <TasksDueSoon hideIfNoData />
      </Container>
      <AlertsGrid hideIfNoData />
      <ForecastGrid />
    </>
  );
};

export default Backlog;
