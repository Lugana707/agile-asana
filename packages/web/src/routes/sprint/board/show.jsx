import React, { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import collect from "collect.js";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";
import SprintJumbotron from "../../../components/sprint/jumbotron";
import GithubLogo from "../../../images/github/GitHub-Mark-32px.png";

const Board = ({ sprint }) => {
  const { tasks, sections } = sprint || {};

  const subtasks = useMemo(() => tasks.pluck("subtasks").flatten(1), [tasks]);

  const getTaskSections = useCallback(
    tasks =>
      sections.map(({ uuid, name }) => ({
        uuid,
        name: name || "Untitled",
        tasks: tasks.filter(
          task => !!collect(task.sections).firstWhere("uuid", uuid)
        )
      })),
    [sections]
  );

  const tasksWithSubtasks = useMemo(
    () =>
      tasks
        .whereNotIn("uuid", subtasks.toArray())
        .where("subtasks.length", true)
        .filter(({ subtasks }) => tasks.whereIn("uuid", subtasks).isNotEmpty()),
    [tasks, subtasks]
  );

  const tasksWithoutSubtasks = useMemo(
    () =>
      tasks
        .whereNotIn("uuid", subtasks.toArray())
        .where("subtasks.length", false),
    [tasks, subtasks]
  );

  const getSubtasks = useCallback(
    task => tasks.whereIn("uuid", task.subtasks),
    [tasks]
  );

  if (!sprint || sections.isEmpty()) {
    return <div />;
  }

  const TaskCard = ({ task }) => {
    const { uuid, name, completedAt, pullRequests } = task;

    return (
      <Card bg="dark" text="light" className="text-left">
        <Card.Body>
          <Card.Subtitle>
            <Link
              to={`/task/${uuid}`}
              className={completedAt ? "text-muted" : ""}
            >
              {name}
            </Link>
          </Card.Subtitle>
          {pullRequests.isNotEmpty() && (
            <Card.Text className="pt-2">
              {pullRequests.map(({ uuid, title, mergedAt, htmlUrl }) => (
                <a
                  key={uuid}
                  rel="noopener noreferrer"
                  target="_blank"
                  as={Button}
                  href={htmlUrl}
                  className={`d-block text-light p-0 ${
                    completedAt ? "text-muted" : ""
                  }`}
                  style={{ textDecoration: mergedAt && "line-through" }}
                >
                  <Image src={GithubLogo} className="h-100" fluid />
                  <span className="pl-1">{title}</span>
                </a>
              ))}
            </Card.Text>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <>
      <SprintJumbotron sprint={sprint} title="Tasks" />
      <Container fluid>
        <Row>
          <Col xs={12}>
            <h4>All Tasks (exluding subtasks)</h4>
            <hr className="my-4" />
          </Col>
          {getTaskSections(
            tasksWithoutSubtasks.merge(tasksWithSubtasks.toArray())
          ).map(({ uuid, name, tasks }) => (
            <Col key={uuid}>
              <h4>
                <span>{name}</span>
                <span className="pl-1 text-muted">({tasks.count()})</span>
              </h4>
              {tasks.map(task => (
                <TaskCard key={task.uuid} task={task} />
              ))}
            </Col>
          ))}
        </Row>
        {tasksWithSubtasks.map(task => (
          <Row key={task.uuid}>
            <Col xs={12}>
              <h4>{task.name}</h4>
              <hr className="my-4" />
            </Col>
            {getTaskSections(getSubtasks(task)).map(({ uuid, name, tasks }) => (
              <Col key={uuid}>
                <h4>
                  <span>{name}</span>
                  <span className="pl-1 text-muted">({tasks.count()})</span>
                </h4>
                {tasks.map(task => (
                  <TaskCard key={task.uuid} task={task} />
                ))}
              </Col>
            ))}
          </Row>
        ))}
      </Container>
    </>
  );
};

export default withSprintFromURL(Board);
