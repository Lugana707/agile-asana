import React, { useMemo } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import moment from "moment";
import Table from "./_table";
import SprintTaskTableRow from "./_sprintTaskTableRow";

const SprintCardAndTable = ({ sprint }) => {
  const { tasks, number, storyPoints, finishedOn } = sprint;

  return (
    <>
      <Col xs={3} className="pr-1">
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
      </Col>
      <Col xs={9} className="pl-1">
        <Table className="mt-1 mb-1" data={tasks} row={SprintTaskTableRow} />
      </Col>
    </>
  );
};

export default SprintCardAndTable;
