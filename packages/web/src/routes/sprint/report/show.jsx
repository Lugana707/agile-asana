import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import collect from "collect.js";
import SprintBreakdown from "../../../components/sprint/tables/breakdown";
import SprintReleases from "../../../components/sprint/tables/releases";
import SprintJumbotron from "../../../components/sprint/jumbotron";
import SprintDistributionCustomField from "../../../components/sprint/tables/distributionCustomField";
import withSprints from "../../../components/sprint/withSprints";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";

const SPRINT_BREAKDOWN_COUNT = 5;

const Report = ({ sprint, sprints }) => {
  const recentSprints = useMemo(
    () =>
      sprints
        .filter(({ finishedOn }) => sprint.finishedOn.isSameOrAfter(finishedOn))
        .take(SPRINT_BREAKDOWN_COUNT),
    [sprints, sprint]
  );

  const { tasks, tasksCompleted } = sprint || {};

  const releases = useMemo(
    () =>
      sprint.releases.map(({ uuid, name, publishedAt }) => ({
        uuid,
        name: (
          <span>
            {name}
            <span className="text-muted pl-1">
              {publishedAt.format("dddd, MMM Do @ LT")}
            </span>
          </span>
        )
      })),
    [sprint.releases]
  );

  const commitmentsMet = useMemo(
    () =>
      collect(tasksCompleted)
        .where("tags.length")
        .map(task => ({ ...task, to: `/task/${task.uuid}` })),
    [tasksCompleted]
  );
  const unplannedWork = useMemo(
    () =>
      collect(tasks)
        .filter(({ tags }) => collect(tags).some("Unplanned"))
        .map(task => ({ ...task, to: `/task/${task.uuid}` })),
    [tasks]
  );
  const commitmentsMissed = useMemo(
    () =>
      collect(tasks)
        .where("tags.length")
        .filter(({ uuid }) => !commitmentsMet.pluck("uuid").some(uuid))
        .map(task => ({ ...task, to: `/task/${task.uuid}` })),
    [tasks, commitmentsMet]
  );

  if (!sprint) {
    return <div className="loading-spinner centre" />;
  }

  const SummaryColumn = ({ title, data }) => (
    <Col xs={12} lg={6}>
      <h2>
        {title} ({data.count()})
      </h2>
      <ol>
        {data.map(({ uuid, name, to }) => (
          <li key={uuid}>
            {to ? (
              <Link
                className="btn btn-link text-left text-light p-0 d-block"
                to={to}
              >
                <span className="pl-1 pr-1">{name}</span>
              </Link>
            ) : (
              <span className="pl-1 pr-1 mt-2 mb-2">{name}</span>
            )}
          </li>
        ))}
      </ol>
    </Col>
  );

  return (
    <>
      <SprintJumbotron sprint={sprint} title="Report" />
      <Container className="text-left">
        <Row>
          <Col xs={12}>
            <h1>Comparison</h1>
            <hr className="my-4" />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h2>Sprint Breakdown</h2>
            <SprintBreakdown loading={!sprint} sprints={recentSprints} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h1>Summary</h1>
            <hr className="my-4" />
          </Col>
          <SummaryColumn title="Releases" data={releases} />
          <SummaryColumn title="Commitments Met" data={commitmentsMet} />
          <SummaryColumn title="Commitments Missed" data={commitmentsMissed} />
          <SummaryColumn title="Unplanned Work" data={unplannedWork} />
        </Row>
        <Row>
          <Col xs={12}>
            <h1>Effort Distribution</h1>
            <hr className="my-4" />
          </Col>
          <Col xs={12}>
            <SprintDistributionCustomField sprint={sprint} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h1>Releases ({sprint.releases.count()})</h1>
            <hr className="my-4" />
          </Col>
          <Col xs={12}>
            <SprintReleases sprint={sprint} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withSprintFromURL(withSprints(Report));
