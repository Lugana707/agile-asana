import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import collect from "collect.js";
import pluralise from "pluralise";
import withSprints from "../../components/sprint/withSprints";
import withTaskFromURL from "../../components/task/withTaskFromURL";
import TaskJumbotron from "../../components/task/jumbotron";
import SprintInfoCard from "../../components/sprint/infoCard";
import TagBadge from "../../components/task/badges/tag";
import CustomFieldBadge from "../../components/task/badges/customField";
import Widget from "../../components/library/widget";
import AsanaUserBadge from "../../components/user/badges/asana";
import Table from "../../components/library/table";
import TaskTableRow from "../../components/task/tableRow";
import SimilarTaskList from "../../components/task/similarTaskList";

const ShowTask = ({ task, sprints }) => {
  const {
    description,
    dueOn,
    createdAt,
    storyPoints,
    tags,
    customFields,
    completedAt,
    mostRecentSprint,
    forecastSprint,
    sprints: taskSprintUUIDs = [],
    createdBy,
    assignee,
    parent,
    subtasks,
    percentComplete
  } = task || {};

  const tagsSorted = useMemo(() => collect(tags).sort(), [tags]);

  const sortedCustomFields = useMemo(
    () => collect(customFields).sortBy("name"),
    [customFields]
  );

  const taskSprints = useMemo(
    () => sprints.filter(({ uuid }) => taskSprintUUIDs.includes(uuid)),
    [taskSprintUUIDs, sprints]
  );

  const completedAtSprint = useMemo(
    () => completedAt && sprints.firstWhere("uuid", mostRecentSprint),
    [completedAt, sprints, mostRecentSprint]
  );
  const currentSprint = useMemo(
    () =>
      !completedAtSprint &&
      mostRecentSprint &&
      sprints.where("isCurrentSprint").firstWhere("uuid", mostRecentSprint),
    [sprints, completedAtSprint, mostRecentSprint]
  );
  const previousSprints = useMemo(
    () =>
      taskSprints
        .when(!!completedAtSprint, collection =>
          collection.where("uuid", "!==", completedAtSprint.uuid)
        )
        .when(currentSprint, collection =>
          collection.where("uuid", "!==", currentSprint.uuid)
        ),
    [taskSprints, completedAtSprint, currentSprint]
  );

  const fromBacklogToDoneInDays = useMemo(
    () => (completedAt ? completedAt.diff(createdAt, "days") : false),
    [completedAt, createdAt]
  );

  const completeAtOrForecastAt = useMemo(
    () => completedAt || (forecastSprint && forecastSprint.completedAt),
    [completedAt, forecastSprint]
  );

  if (!task) {
    return <div />;
  }

  return (
    <>
      <TaskJumbotron task={task} />
      <Container className="text-left">
        {(tagsSorted.isNotEmpty() ||
          storyPoints ||
          completedAt ||
          percentComplete !== false) && (
          <>
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
              {percentComplete !== false && (
                <Widget
                  bg={
                    percentComplete < 50
                      ? "danger"
                      : percentComplete < 100
                      ? "warning"
                      : "success"
                  }
                  text="dark"
                >
                  <h1 className="text-nowrap d-inline">
                    <span>{percentComplete}%</span>
                  </h1>
                  <small className="d-block">Complete</small>
                </Widget>
              )}
            </Row>
            <hr />
          </>
        )}
        <Row>
          {parent && (
            <Col xs={12} className="mb-3">
              <Card bg="dark" text="light">
                <Card.Body>
                  <Card.Subtitle className="text-muted pb-2">
                    Parent task
                  </Card.Subtitle>
                  <Card.Title>
                    <Link
                      as={Button}
                      to={`/task/${parent.uuid}`}
                      variant="link"
                    >
                      {parent.name}
                    </Link>
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          )}
          <Col xs={12} md={6} lg={3}>
            <Card bg="dark" text="light" className="h-100">
              <Card.Body>
                {assignee && (
                  <>
                    <Card.Subtitle className="text-muted pb-2">
                      Assigned to
                    </Card.Subtitle>
                    <Card.Title>
                      <AsanaUserBadge user={assignee} />
                    </Card.Title>
                    <hr />
                  </>
                )}
                <Card.Text as="table" className="w-100">
                  <tbody>
                    <tr>
                      <td className="text-muted">Story Points</td>
                      <td className="text-center">{storyPoints}</td>
                    </tr>
                    {!completedAtSprint && forecastSprint && (
                      <tr>
                        <td className="text-muted">Forecast Sprint</td>
                        <td className="text-center">{forecastSprint.number}</td>
                      </tr>
                    )}
                    {completedAtSprint && (
                      <tr>
                        <td className="text-muted">Completed Sprint</td>
                        <td className="text-center">
                          {completedAtSprint.number}
                        </td>
                      </tr>
                    )}
                    {sortedCustomFields.isNotEmpty() && (
                      <>
                        <tr>
                          <td colSpan="2">
                            <hr />
                          </td>
                        </tr>
                        {sortedCustomFields.map(obj => (
                          <tr key={obj.value.name}>
                            <td className="text-muted">{obj.name}</td>
                            <td className="text-center">
                              <CustomFieldBadge customField={obj.value} />
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                    <tr>
                      <td colSpan="2">
                        <hr />
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Created</td>
                      <td className="text-center text-nowrap">
                        {createdAt.format("YYYY-MM-DD")}
                      </td>
                    </tr>
                    {dueOn && (
                      <tr
                        style={{
                          textDecoration: completedAt && "line-through"
                        }}
                      >
                        <td className="text-muted">Due</td>
                        <td className="text-center text-nowrap">
                          {dueOn.format("YYYY-MM-DD")}
                        </td>
                      </tr>
                    )}
                    {completedAt && (
                      <tr>
                        <td className="text-muted">Completed</td>
                        <td className="text-center text-nowrap">
                          {completedAt.format("YYYY-MM-DD")}
                        </td>
                      </tr>
                    )}
                    {!completedAt && forecastSprint && (
                      <tr>
                        <td className="text-muted">Forecast</td>
                        <td className="text-center text-nowrap">
                          {forecastSprint.finishedOn.format("YYYY-MM-DD")}
                        </td>
                      </tr>
                    )}
                    {dueOn && (
                      <tr
                        className={
                          dueOn.isBefore(completeAtOrForecastAt)
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        <td className="text-muted">
                          {dueOn.isBefore(completeAtOrForecastAt)
                            ? "Late"
                            : "Early"}
                        </td>
                        <td className="text-center text-nowrap">
                          {dueOn.from(completeAtOrForecastAt, true)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={9} className="mt-3 mt-md-0">
            <Card bg="dark" text="light" className="h-100">
              <Card.Body>
                <Card.Subtitle className="text-muted pb-2">
                  Created by
                </Card.Subtitle>
                <Card.Title>
                  <AsanaUserBadge user={createdBy} />
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
          {subtasks.isNotEmpty() && (
            <Col xs={12} className="pt-3">
              <Card bg="dark" text="light">
                <Card.Body>
                  <Card.Subtitle className="text-muted pb-2">
                    Subtasks
                  </Card.Subtitle>
                  <Card.Text as="div">
                    <Table
                      className="mt-1 mb-1"
                      data={subtasks.sortByDesc("completedAt").toArray()}
                      row={TaskTableRow}
                      variant="dark"
                    />
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            <h4 className="bg-primary p-2 rounded text-dark">
              <span>Similar Tasks</span>
              <small className="pl-2">(that have been refined)</small>
            </h4>
            <SimilarTaskList task={task} count={3} />
          </Col>
        </Row>
        <hr />
        <Row>
          {completedAtSprint && (
            <Col xs={12} md={6} className="pb-4">
              <h4>Completed in</h4>
              <SprintInfoCard sprint={completedAtSprint} showSummary />
            </Col>
          )}
          {currentSprint && (
            <Col xs={12} md={6} className="pb-4">
              <h4>Currently in</h4>
              <SprintInfoCard sprint={currentSprint} showSummary />
            </Col>
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

export default withTaskFromURL(withSprints(ShowTask));
