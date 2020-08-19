import React, { useMemo } from "react";
import { Container, Jumbotron } from "react-bootstrap";
import { useSelector } from "react-redux";
import ForecastGrid from "./grid";
import TasksAtRiskCardAndTable from "../alerts/_tasksAtRiskCardAndTable";

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
          <h1>Forecast / Dashboard</h1>
          <p>
            <span>Forecasting with </span>
            <span className="font-weight-bold">
              {runningAverageCompletedStoryPoints} story points
            </span>
            <span> per sprint.</span>
          </p>
        </Container>
      </Jumbotron>
      <TasksAtRiskCardAndTable hideIfNoData />
      <ForecastGrid />
    </>
  );
};

export default Backlog;
