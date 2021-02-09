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
  faTag,
  faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";
import {
  faCheckCircle,
  faTimesCircle
} from "@fortawesome/free-regular-svg-icons";
import { useSelector } from "react-redux";
import collect from "collect.js";
import { pullRequests as pullRequestsSelector } from "../../../scripts/redux/selectors/code";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";
import GithubLogo from "../../../images/github/GitHub-Mark-32px.png";
import AsanaUserBadge from "../../../components/user/badges/asana";
import GithubUserBadge from "../../../components/user/badges/github";
import TagBadge from "../../../components/task/badges/tag";

const Board = ({ sprint }) => {
  const pullRequests = useSelector(pullRequestsSelector);

  const { tasks, sections } = sprint || {};

  const [sectionFocus, setSectionFocus] = useState("default");

  const subtasks = useMemo(() => tasks.pluck("subtasks").flatten(1), [tasks]);

  const getTaskSections = useCallback(
    (tasks, pullRequests) =>
      sections.map(({ uuid, name }, index, array) => ({
        uuid,
        name: name || "Untitled",
        tasks: tasks.filter(
          task =>
            (!task.sections && index === 0) ||
            !!collect(task.sections).firstWhere("uuid", uuid)
        ),
        pullRequests: pullRequests
          ? pullRequests.filter(({ closedAt, requestedReviewers, draft }) => {
              if (closedAt) {
                return index === array.length - 1;
              } else if (draft) {
                return index === 1;
              } else if (requestedReviewers.length) {
                return index === array.length - 2;
              }

              return index === 0;
            })
          : collect([])
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

  const orphanedPullRequests = useMemo(
    () =>
      pullRequests.where("state", "open").whereNotIn(
        "uuid",
        tasks
          .pluck("pullRequests")
          .flatten(1)
          .pluck("uuid")
          .toArray()
      ),
    [pullRequests, tasks]
  );

  const getSubtasks = useCallback(
    task => tasks.whereIn("uuid", task.subtasks),
    [tasks]
  );

  const getBlockers = useCallback(
    task => tasks.whereIn("uuid", task.dependencies.toArray()),
    [tasks]
  );

  const getBlocking = useCallback(
    task => tasks.whereIn("uuid", task.dependents.toArray()),
    [tasks]
  );

  if (!sprint || sections.isEmpty()) {
    return <div />;
  }

  const ReleaseRow = ({ release, ...props }) => {
    const { htmlUrl, name, prerelease, publishedAt, draft } = release;

    return (
      <Row {...props}>
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
    );
  };

  const PullRequestRow = ({ pullRequest, ...props }) => {
    const {
      title,
      mergedAt,
      closedAt,
      htmlUrl,
      requestedReviewers,
      assignees
    } = pullRequest;

    return (
      <Row {...props}>
        <Col xs={2} className="text-center">
          <Image src={GithubLogo} fluid />
        </Col>
        <Col>
          {!closedAt && (
            <small className="float-right">
              {(requestedReviewers.length ? requestedReviewers : assignees).map(
                (assignee, index) => (
                  <GithubUserBadge
                    className={`d-inline-block ${!!index && "pl-1"}`}
                    key={assignee.id}
                    user={assignee}
                    hideName
                  />
                )
              )}
            </small>
          )}
          <a
            rel="noopener noreferrer"
            target="_blank"
            as={Button}
            href={htmlUrl}
            className={`d-block text-dark p-0 ${closedAt ? "text-muted" : ""}`}
            style={{
              textDecoration: (mergedAt || closedAt) && "line-through"
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
    );
  };

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

    const blockers = getBlockers(task);
    const blocking = getBlocking(task);

    return (
      <Card bg="dark" text="light" className="text-left mb-2">
        <Card.Body>
          <Card.Link
            as={Link}
            className={
              blockers.isNotEmpty()
                ? "text-danger"
                : blocking.isNotEmpty()
                ? "text-warning"
                : completedAt
                ? "text-muted"
                : ""
            }
            to={`/task/${uuid}`}
          >
            {blockers.isNotEmpty() && (
              <FontAwesomeIcon
                className="mr-1 text-danger"
                icon={faExclamationCircle}
              />
            )}
            {blocking.isNotEmpty() && (
              <FontAwesomeIcon
                className="mr-1 text-warning"
                icon={faExclamationCircle}
              />
            )}
            {completedAt && (
              <FontAwesomeIcon
                className="mr-1 text-success"
                icon={faCheckCircle}
              />
            )}
            <span>{name}</span>
          </Card.Link>
        </Card.Body>
        {(pullRequests.isNotEmpty() ||
          releases.isNotEmpty() ||
          blocking.isNotEmpty() ||
          blockers.isNotEmpty()) && (
          <ListGroup className="list-group-flush">
            {blocking.map(block => (
              <ListGroup.Item key={block.uuid} variant="warning">
                <Row>
                  <Col className="d-flex align-items-center">
                    <Badge variant="warning" className="mr-4">
                      blocking
                    </Badge>
                    <Card.Link
                      as={Link}
                      className="text-dark"
                      to={`/task/${uuid}`}
                    >
                      {block.name}
                    </Card.Link>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
            {blockers.map(block => (
              <ListGroup.Item key={block.uuid} variant="danger">
                <Row>
                  <Col className="d-flex align-items-center">
                    <Badge variant="danger" className="mr-4">
                      blocked by
                    </Badge>
                    <Card.Link
                      as={Link}
                      className="text-dark"
                      to={`/task/${uuid}`}
                    >
                      {block.name}
                    </Card.Link>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
            {releases.map(release => (
              <ListGroup.Item key={release.uuid} variant="dark">
                <ReleaseRow release={release} />
              </ListGroup.Item>
            ))}
            {pullRequests.map(pullRequest => (
              <ListGroup.Item key={pullRequest.uuid} variant="dark">
                <PullRequestRow pullRequest={pullRequest} />
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        {((!completedAt && assignee) || tags.length > 0) && (
          <Card.Body>
            <Card.Subtitle>
              {!completedAt && assignee && (
                <AsanaUserBadge
                  className="float-right ml-2"
                  user={assignee}
                  hideName
                />
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

  const CollapsibleTaskRow = ({ name, tasks, pullRequests, id = false }) => (
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
        getTaskSections(tasks, pullRequests).map(
          ({ uuid, name, tasks, pullRequests }) => (
            <Col key={uuid}>
              <h4>
                <span>{name}</span>
                <span className="ml-1 text-muted">({tasks.count()})</span>
              </h4>
              <div className="overflow-auto" style={{ maxHeight: "80vh" }}>
                {tasks.map(task => (
                  <TaskCard key={task.uuid} task={task} />
                ))}
                {pullRequests.map(pullRequest => (
                  <Card
                    key={pullRequest.uuid}
                    bg="warning"
                    text="dark"
                    className="text-left mb-2"
                  >
                    <Card.Body>
                      <PullRequestRow
                        key={pullRequest.uuid}
                        pullRequest={pullRequest}
                      />
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          )
        )}
    </Row>
  );

  return (
    <Container fluid style={{ maxWidth: "1600px" }}>
      <CollapsibleTaskRow
        id="default"
        name="All Tasks (exluding subtasks)"
        tasks={tasksWithoutSubtasks.merge(tasksWithSubtasks.toArray())}
        pullRequests={orphanedPullRequests}
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
