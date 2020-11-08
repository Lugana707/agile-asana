import React, { useMemo } from "react";
import { Container, Jumbotron } from "react-bootstrap";
import { useSelector } from "react-redux";
import ForecastGrid from "./grid";
import TasksAtRiskCardAndTable from "../../../components/backlog/alerts/tasksAtRiskCardAndTable";
import withCurrentSprint from "../../../components/sprint/withCurrentSprint";

const Backlog = ({ currentSprint }) => {
  const { sprints } = useSelector(state => state.sprints);

  const averageCompletedStoryPoints = useMemo(() => {
    if (currentSprint) {
      return currentSprint.averageCompletedStoryPoints || "?";
    }
    return 0;
  }, [currentSprint]);

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

export default withCurrentSprint(Backlog);
