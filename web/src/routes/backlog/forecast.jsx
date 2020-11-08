import React, { useMemo } from "react";
import { Jumbotron, Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import TasksAtRiskCardAndTable from "../../components/backlog/alerts/tasksAtRiskCardAndTable";
import withCurrentSprint from "../../components/sprint/withCurrentSprint";
import withForecastSprints from "../../components/backlog/withForecastSprints";
import SprintCardAndTable from "../../components/library/sprintCardAndTable";

const Forecast = ({ forecastSprints, currentSprint }) => {
  const averageCompletedStoryPoints = useMemo(() => {
    if (currentSprint) {
      return currentSprint.averageCompletedStoryPoints || "?";
    }
    return 0;
  }, [currentSprint]);

  if (!forecastSprints) {
    return <div />;
  }

  return (
    <>
      <Jumbotron fluid className="bg-primary text-left">
        <Container>
          <h1>Backlog / Forecast</h1>
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
            <SprintCardAndTable sprint={sprint} />
          </Row>
        ))}
      </Container>
    </>
  );
};

export default withForecastSprints(withCurrentSprint(Forecast));
