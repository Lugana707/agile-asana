import React, { useMemo } from "react";
import { Container, Jumbotron } from "react-bootstrap";
import { useSelector } from "react-redux";
import ForecastGrid from "./grid";
import collect from "collect.js";
import TasksAtRiskCardAndTable from "../alerts/_tasksAtRiskCardAndTable";

const Backlog = () => {
  const { sprints } = useSelector(state => state.sprints);

  const averageCompletedStoryPoints = useMemo(() => {
    const currentSprint = collect(sprints)
      .where("state", "ACTIVE")
      .first();
    if (currentSprint) {
      return currentSprint.averageCompetedStoryPoints;
    }
    return 0;
  }, [sprints]);

  if (!sprints) {
    return <div />;
  }

  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Forecast / Dashboard</h1>
          <p>
            <span>Forecasting with </span>
            <span className="font-weight-bold">
              {averageCompletedStoryPoints} story points
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
