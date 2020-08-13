import React, { useMemo } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import moment from "moment";
import Table from "../../_library/_table";
import BacklogTableRow from "../_backlogTableRow";

const BacklogForecastTable = () => {
  const { loading, refined } = useSelector(state => state.backlogTasks);
  const { asanaProjectTasks } = useSelector(state => state.asanaProjectTasks);

  const sprints = useMemo(() => asanaProjectTasks || [], [asanaProjectTasks]);
  const currentSprint = useMemo(() => sprints[0], [sprints]);
  const forecastStoryPoints = useMemo(
    () => (currentSprint || {}).runningAverageCompletedStoryPoints,
    [currentSprint]
  );

  const tagMap = {
    Bug: "danger",
    "Technical Debt": "warning"
  };

  const forecast = useMemo(() => {
    let index = 0;
    let totalStoryPoints = 0;
    return (refined || [])
      .filter(
        ({ projects }) =>
          !projects.map(({ gid }) => gid).includes(currentSprint.gid)
      )
      .reduce((accumulator, currentValue) => {
        const { storyPoints = 0 } = currentValue;
        totalStoryPoints = totalStoryPoints + storyPoints;

        if (totalStoryPoints >= forecastStoryPoints) {
          index = index + 1;
          totalStoryPoints = storyPoints;
        }

        let tasks = [...accumulator];
        tasks[index] = (accumulator[index] || []).concat([currentValue]);

        return tasks;
      }, [])
      .map((tasks, index) => ({
        week: index + 1 + currentSprint.week,
        storyPoints: tasks.reduce(
          (accumulator, { storyPoints = 0 }) => accumulator + storyPoints,
          0
        ),
        tasks
      }));
  }, [refined, forecastStoryPoints, currentSprint]);

  if (!asanaProjectTasks) {
    return <div />;
  }

  const SprintCard = ({ data, index }) => {
    const { week, storyPoints } = data;
    const completedOn = moment(currentSprint.dueOn)
      .add(index + 1, "weeks")
      .format("YYYY-MM-DD");

    return (
      <Card bg="dark" text="light" className="text-left h-100">
        <Card.Body>
          <Card.Title className="float-left">{completedOn}</Card.Title>
          <Card.Title as="h1" className="float-right text-info">
            {week}
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
