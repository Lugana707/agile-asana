import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import collect from "collect.js";
import SprintBreakdown from "../../../components/sprint/tables/breakdown";
import SprintJumbotron from "../../../components/sprint/jumbotron";
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

  if (!sprint) {
    return <div className="loading-spinner centre" />;
  }

  const { tasks, tasksCompleted } = sprint;

  const commitmentsMet = collect(tasksCompleted).where("tags.length");
  const unplannedWork = collect(tasks).filter(({ tags }) =>
    collect(tags).some("Unplanned")
  );
  const commitmentsMissed = collect(tasks)
    .where("tags.length")
    .filter(({ uuid }) => !commitmentsMet.pluck("uuid").some(uuid));

  const SummaryRow = ({ title, tasks }) => (
    <Row>
      <Col>
        <h2>
          {tasks.count()} {title}
        </h2>
        <ol>
          {tasks.map(({ uuid, name }) => (
            <li key={uuid}>
              <Link
                className="btn btn-link text-left text-light p-0 d-block"
                to={`/task/${uuid}`}
              >
                <span className="pl-1 pr-1">{name}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Col>
    </Row>
  );

  return (
    <>
      <SprintJumbotron sprint={sprint} title="Report" />
      <Container className="text-left">
        <Row>
          <Col>
            <h1>Comparison</h1>
            <hr className="my-4" />
          </Col>
        </Row>
        <Row>
          <Col>
            <h2>Sprint Breakdown</h2>
            <SprintBreakdown loading={!sprint} sprints={recentSprints} />
          </Col>
        </Row>
        <Row>
          <Col>
            <h1>Summary</h1>
            <hr className="my-4" />
          </Col>
        </Row>
        <SummaryRow title="Commitments Met" tasks={commitmentsMet} />
        <SummaryRow title="Unplanned Work" tasks={unplannedWork} />
        <SummaryRow title="Commitments Missed" tasks={commitmentsMissed} />
      </Container>
    </>
  );
};

export default withSprintFromURL(withSprints(Report));
