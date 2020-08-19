import React, { useMemo } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import moment from "moment";
import SprintCardAndTable from "../../_library/_sprintCardAndTable";

const BacklogForecastTable = () => {
  const { sprints, loading } = useSelector(state => state.sprints);

  const forecast = useMemo(
    () => sprints.filter(({ state }) => state === "FORECAST"),
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
