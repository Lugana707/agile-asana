import React, { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  ListGroup,
  Badge
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleUp,
  faAngleDoubleDown,
  faTag
} from "@fortawesome/free-solid-svg-icons";
import {
  faCheckCircle,
  faTimesCircle
} from "@fortawesome/free-regular-svg-icons";
import collect from "collect.js";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";
import GithubLogo from "../../../images/github/GitHub-Mark-32px.png";
import AsanaUserBadge from "../../../components/user/badges/asana";
import GithubUserBadge from "../../../components/user/badges/github";
import TagBadge from "../../../components/task/badges/tag";

const Board = ({ sprint }) => {
  const { tasks, sections } = sprint || {};

  const [sectionFocus, setSectionFocus] = useState("default");

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
    const {
      uuid,
      name,
      weight,
      completedAt,
      assignee,
      tags,
      pullRequests
    } = task;

    const releases = getSubtasks(task)
      .pluck("releases")
      .flatten(1)
      .merge(task.releases.toArray())
      .unique("uuid")
      .sortByDesc(({ publishedAt, createdAt }) =>
        (publishedAt || createdAt).unix()
      );

    return (
      <Card bg="dark" text="light" className="text-left mb-2">
        <Card.Body>
          <Card.Link
            as={Link}
            className={completedAt ? "text-muted" : ""}
            to={`/task/${uuid}`}
          >
            {completedAt && (
              <FontAwesomeIcon
                className="mr-1 text-success"
                icon={faCheckCircle}
              />
            )}
            <span>{name}</span>
          </Card.Link>
        </Card.Body>
        {(pullRequests.isNotEmpty() || releases.isNotEmpty()) && (
          <ListGroup className="list-group-flush">
            {releases.map(
              ({ uuid, name, publishedAt, htmlUrl, prerelease, draft }) => (
                <ListGroup.Item key={uuid} variant="dark">
                  <Row>
                    <Col xs={2} className="text-center">
                      <FontAwesomeIcon icon={faTag} />
                    </Col>
                    <Col className="d-flex align-items-center">
                      <a
                        rel="noopener noreferrer"
                        target="_blank"
                        as={Button}
                        href={htmlUrl}
                        className="d-block text-dark p-0"
                      >
                        {name}
                      </a>
                      <Badge
                        variant={
                          draft
                            ? "light"
                            : prerelease
                            ? "warning"
                            : publishedAt
                            ? "success"
                            : "danger"
                        }
                        className="ml-auto"
                      >
                        {draft
                          ? "draft"
                          : prerelease
                          ? "rerelease"
                          : publishedAt
                          ? publishedAt.format("dddd, MMM Do @ LT")
                          : "unknown"}
                      </Badge>
                    </Col>
                  </Row>
                </ListGroup.Item>
              )
            )}
            {pullRequests.map(
              ({
                uuid,
                title,
                mergedAt,
                closedAt,
                htmlUrl,
                requestedReviewers,
                assignees
              }) => (
                <ListGroup.Item key={uuid} variant="dark">
                  <Row>
                    <Col xs={2} className="text-center">
                      <Image src={GithubLogo} fluid />
                    </Col>
                    <Col>
                      {!closedAt && (
                        <small className="float-right">
                          {(requestedReviewers.length
                            ? requestedReviewers
                            : assignees
                          ).map(assignee => (
                            <GithubUserBadge
                              key={assignee.id}
                              user={assignee}
                            />
                          ))}
                        </small>
                      )}
                      <a
                        rel="noopener noreferrer"
                        target="_blank"
                        as={Button}
                        href={htmlUrl}
                        className={`d-block text-dark p-0 ${
                          closedAt ? "text-muted" : ""
                        }`}
                        style={{
                          textDecoration:
                            (mergedAt || closedAt) && "line-through"
                        }}
                      >
                        <span>{title}</span>
                        {!mergedAt && closedAt && (
                          <FontAwesomeIcon
                            className="ml-1 text-danger"
                            icon={faTimesCircle}
                          />
                        )}
                      </a>
                    </Col>
                  </Row>
                </ListGroup.Item>
              )
            )}
          </ListGroup>
        )}
        {((!completedAt && assignee) || tags.length > 0) && (
          <Card.Body>
            <Card.Subtitle>
              {!completedAt && assignee && (
                <small className="float-right ml-2">
                  <AsanaUserBadge user={assignee} />
                </small>
              )}
              {weight && (
                <Badge variant="primary" className="mr-1" pill>
                  {weight}
                </Badge>
              )}
              {tags.map(tag => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </Card.Subtitle>
          </Card.Body>
        )}
      </Card>
    );
  };

  const CollapsibleTaskRow = ({ name, tasks, id = false }) => (
    <Row>
      <Col xs={12}>
        <Button
          as="h4"
          className="pb-0 mb-0"
          onClick={() => setSectionFocus(sectionFocus === id ? false : id)}
          variant="link"
          size="lg"
        >
          <span>
            {name} ({tasks.count()})
          </span>
          <FontAwesomeIcon
            className="ml-2"
            icon={sectionFocus === id ? faAngleDoubleDown : faAngleDoubleUp}
          />
        </Button>
        <hr className="my-2" />
      </Col>
      {sectionFocus === id &&
        getTaskSections(tasks).map(({ uuid, name, tasks }) => (
          <Col key={uuid}>
            <h4>
              <span>{name}</span>
              <span className="ml-1 text-muted">({tasks.count()})</span>
            </h4>
            <div className="overflow-auto" style={{ maxHeight: "80vh" }}>
              {tasks.map(task => (
                <TaskCard key={task.uuid} task={task} />
              ))}
            </div>
          </Col>
        ))}
    </Row>
  );

  return (
    <Container fluid style={{ maxWidth: "1600px" }}>
      <CollapsibleTaskRow
        id="default"
        name="All Tasks (exluding subtasks)"
        tasks={tasksWithoutSubtasks.merge(tasksWithSubtasks.toArray())}
        startCollapsed={false}
      />
      {tasksWithSubtasks.map(task => (
        <CollapsibleTaskRow
          id={task.uuid}
          key={task.uuid}
          name={
            <>
              {task.completedAt && (
                <FontAwesomeIcon
                  className="text-success mr-1"
                  icon={faCheckCircle}
                />
              )}
              <span>{task.name}</span>
            </>
          }
          tasks={getSubtasks(task)}
          startCollapsed={!!task.completedAt}
        />
      ))}
    </Container>
  );
};

export default withSprintFromURL(Board);
