import React, { useMemo } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import moment from "moment";
import Table from "../../_library/_table";
import BacklogTableRow from "../_backlogTableRow";

const BacklogForecastTable = () => {
  const { sprints, loading } = useSelector(state => state.sprints);

  const forecast = useMemo(
    () => sprints.filter(({ state }) => state === "FORECAST"),
    [sprints]
  );

  if (!sprints) {
    return <div />;
  }

  const SprintCard = ({ data, index }) => {
    const { number, storyPoints, finishedOn } = data;

    return (
      <Card bg="dark" text="light" className="text-left h-100">
        <Card.Body>
          <Card.Title className="float-left">
            {moment(finishedOn).format("YYYY-MM-DD")}
          </Card.Title>
          <Card.Title as="h1" className="float-right text-info">
            {number}
          </Card.Title>
          <Card.Subtitle className="text-muted">
            <span className="text-nowrap">{storyPoints} story points</span>
          </Card.Subtitle>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid>
      {forecast.map(({ tasks = [], ...sprint }, index) => (
        <Row key={index} className="pb-1">
          <Col xs={3} className="pr-1">
            <SprintCard data={sprint} index={index} />
          </Col>
          <Col xs={9} className="pl-1">
            <Table
              className="mt-1 mb-1"
              loading={loading}
              data={tasks}
              row={BacklogTableRow}
            />
          </Col>
        </Row>
      ))}
    </Container>
  );
};

export default BacklogForecastTable;
