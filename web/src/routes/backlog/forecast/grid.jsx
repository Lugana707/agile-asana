import React, { useMemo } from "react";
import { Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import SprintCardAndTable from "../../../components/library/sprintCardAndTable";

const BacklogForecastTable = () => {
  const { sprints } = useSelector(state => state.sprints);

  const forecast = useMemo(
    () =>
      collect(sprints)
        .where("state", "FORECAST")
        .sortBy("week"),
    [sprints]
  );

  if (!sprints) {
    return <div />;
  }

  return (
    <Container fluid>
      {forecast.map((sprint, index) => (
        <Row key={index} className="pb-1">
          <SprintCardAndTable sprint={sprint} />
        </Row>
      ))}
    </Container>
  );
};

export default BacklogForecastTable;
