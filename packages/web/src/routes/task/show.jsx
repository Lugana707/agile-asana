import React, { useMemo } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import collect from "collect.js";
import pluralise from "pluralise";
import withTaskFromURL from "../../components/task/withTaskFromURL";
import withSprints from "../../components/sprint/withSprints";
import TaskJumbotron from "../../components/task/jumbotron";
import SprintInfoCard from "../../components/sprint/infoCard";
import TagBadge from "../../components/library/tags/badge";
import Widget from "../../components/library/widget";
import UserBadge from "../../components/userBadge";

const ShowTask = ({ task, sprints }) => {
  const {
    description,
    createdAt,
    storyPoints,
    tags,
    completedAt,
    mostRecentSprint,
    sprints: taskSprintUUIDs,
    createdBy,
    assignee
  } = task || {};

  const tagsSorted = useMemo(() => collect(tags).sort(), [tags]);

  const taskSprints = useMemo(
    () => sprints.filter(({ uuid }) => taskSprintUUIDs.includes(uuid)),
    [taskSprintUUIDs, sprints]
  );

  const completedAtSprint = useMemo(
    () => completedAt && sprints.firstWhere("uuid", mostRecentSprint),
    [completedAt, sprints, mostRecentSprint]
  );
  const previousSprints = useMemo(
    () =>
      taskSprints.when(!!completedAtSprint, collection =>
        collection.where("uuid", "!==", completedAtSprint.uuid)
      ),
    [taskSprints, completedAtSprint]
  );

  const fromBacklogToDoneInDays = useMemo(
    () => completedAt && completedAt.diff(createdAt, "days"),
    [completedAt, createdAt]
  );

  if (!task) {
    return <div />;
  }

  return (
    <>
      <TaskJumbotron task={task} />
      <Container className="text-left">
        <Row>
          {tagsSorted.isNotEmpty() && (
            <Col xs={12} className="pb-2">
              {tagsSorted.map((tag, index) => (
                <TagBadge key={index} tag={tag} />
              ))}
            </Col>
          )}
          {storyPoints && (
            <Widget bg="info" text="dark">
              <h1 className="text-nowrap d-inline">{storyPoints}</h1>
              <small className="d-block">story points</small>
            </Widget>
          )}
          {completedAt && (
            <Widget bg="success" text="dark">
              <h1 className="text-nowrap d-inline">
                <span>{fromBacklogToDoneInDays}</span>
                <span> {pluralise(fromBacklogToDoneInDays, "Day")}</span>
              </h1>
              <small className="d-block">from creation to done</small>
            </Widget>
          )}
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            <Card bg="dark" text="light">
              <Card.Body>
                <Card.Subtitle className="text-muted pb-2">
                  {assignee ? "Assigned to" : "Created by"}
                </Card.Subtitle>
                <Card.Title>
                  <UserBadge user={assignee || createdBy} />
                </Card.Title>
                <hr />
                <Card.Text
                  dangerouslySetInnerHTML={{
                    __html: description.replace(/\n/gimu, "<br />")
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <hr />
        <Row>
          {completedAtSprint && (
            <>
              <Col xs={12}>
                <h4>Completed in</h4>
              </Col>
              <Col xs={12} md={6} className="pb-4">
                <SprintInfoCard sprint={completedAtSprint} showSummary />
              </Col>
            </>
          )}
          {previousSprints.isNotEmpty() && (
            <>
              <Col xs={12}>
                <h4>Previously in</h4>
              </Col>
              {previousSprints.map(sprint => (
                <Col key={sprint.uuid} xs={12} md={6} className="pb-4">
                  <SprintInfoCard sprint={sprint} />
                </Col>
              ))}
            </>
          )}
        </Row>
      </Container>
    </>
  );
};

export default withSprints(withTaskFromURL(ShowTask));
