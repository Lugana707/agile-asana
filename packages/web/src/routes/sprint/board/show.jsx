import React, { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleUp,
  faAngleDoubleDown
} from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";
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
                    mergedAt ? "text-muted" : ""
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

  const CollapsibleTaskRow = ({ name, tasks, startCollapsed }) => {
    const [collapsed, setCollapsed] = useState(startCollapsed);

    return (
      <Row>
        <Col xs={12}>
          <Button
            as="h4"
            className="pb-0 mb-0"
            onClick={() => setCollapsed(!collapsed)}
            variant="link"
            size="lg"
          >
            <span>
              {name} ({tasks.count()})
            </span>
            <span className="pl-2">
              <FontAwesomeIcon
                icon={collapsed ? faAngleDoubleUp : faAngleDoubleDown}
              />
            </span>
          </Button>
          <hr className="my-2" />
        </Col>
        {!collapsed &&
          getTaskSections(tasks).map(({ uuid, name, tasks }) => (
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
    );
  };

  return (
    <>
      <Container fluid>
        <CollapsibleTaskRow
          name="All Tasks (exluding subtasks)"
          tasks={tasksWithoutSubtasks.merge(tasksWithSubtasks.toArray())}
          startCollapsed={false}
        />
        {tasksWithSubtasks.map(task => (
          <CollapsibleTaskRow
            key={task.uuid}
            name={task.name}
            tasks={getSubtasks(task)}
            startCollapsed={!!task.completedAt}
          />
        ))}
      </Container>
    </>
  );
};

export default withSprintFromURL(Board);
