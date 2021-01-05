import React, { useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import collect from "collect.js";
import withTaskFromURL from "../../../components/task/withTaskFromURL";
import withSprints from "../../../components/sprint/withSprints";
import withGetTask from "../../../components/task/withGetTask";
import TaskJumbotron from "../../../components/task/jumbotron";
import Table from "../../../components/library/table";
import TaskTableRow from "../../../components/task/tableRow";
import SprintCardAndTable from "../../../components/sprint/task/sprintCardAndTable";

const ShowTask = ({ history, task, sprints, getTask }) => {
  const { uuid, subtasks } = task || {};

  const forecastSprints = useMemo(() => {
    if (!subtasks) {
      return collect([]);
    }

    const taskUUIDs = subtasks.pluck("uuid");

    return taskUUIDs
      .map(obj => getTask(obj))
      .pluck("forecastSprint")
      .where()
      .unique("number")
      .map(({ tasks, ...sprint }) => ({
        ...sprint,
        tasks: collect(tasks)
          .whereIn("uuid", taskUUIDs.toArray())
          .toArray()
      }))
      .sortBy("number");
  }, [subtasks, getTask]);

  const unrefinedSubtasks = useMemo(() => {
    if (!subtasks) {
      return [];
    }

    return subtasks
      .whereNotIn(
        "uuid",
        forecastSprints
          .pluck("tasks")
          .flatten(1)
          .pluck("uuid")
          .sortByDesc("completedAt")
          .toArray()
      )
      .toArray();
  }, [subtasks, forecastSprints]);

  if (!task) {
    return <div />;
  }

  if (subtasks.isEmpty()) {
    history.push(`/task/${uuid}`);
  }

  return (
    <>
      <TaskJumbotron task={task} title="Forecast" />
      <Container className="text-left">
        {forecastSprints.map((sprint, index) => (
          <SprintCardAndTable key={index} sprint={sprint} showSprintCard />
        ))}
        <Row>
          {subtasks.isNotEmpty() && (
            <Col xs={12}>
              <Card bg="dark" text="light">
                <Card.Body>
                  <Card.Title className="pb-2 text-danger">
                    Unrefined Subtasks
                  </Card.Title>
                  <Card.Text as="div">
                    <Table
                      className="mt-1 mb-1"
                      data={unrefinedSubtasks}
                      row={TaskTableRow}
                      variant="dark"
                    />
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
};

export default withRouter(withTaskFromURL(withGetTask(withSprints(ShowTask))));
