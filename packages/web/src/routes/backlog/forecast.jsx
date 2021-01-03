import React, { useMemo } from "react";
import { Jumbotron, Container, Row } from "react-bootstrap";
import TasksAtRiskCardAndTable from "../../components/backlog/alerts/tasksAtRiskCardAndTable";
import withCurrentSprint from "../../components/sprint/withCurrentSprint";
import withForecastSprints from "../../components/backlog/withForecastSprints";
import SprintCardAndTable from "../../components/sprint/task/sprintCardAndTable";

const Forecast = ({ forecastSprints, currentSprint }) => {
  const averageCompletedStoryPoints = useMemo(() => {
    if (currentSprint) {
      return currentSprint.averageCompletedStoryPoints || "?";
    }
    return 0;
  }, [currentSprint]);

  return (
    <>
      <Jumbotron fluid>
        <Container>
          <h1>Backlog / Forecast</h1>
          <hr />
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
      <Container fluid>
        {forecastSprints.map((sprint, index) => (
          <Row key={index} className="pb-1">
            <SprintCardAndTable sprint={sprint} showSprintCard />
          </Row>
        ))}
      </Container>
    </>
  );
};

export default withForecastSprints(withCurrentSprint(Forecast));