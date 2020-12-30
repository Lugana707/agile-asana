import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import { useSelector } from "react-redux";
import SprintBreakdown from "../../../components/sprint/tables/breakdown";
import SprintJumbotron from "../../../components/sprint/jumbotron";

const sprintBreakdownCount = 5;

const Report = ({ match }) => {
  const { uuid } = match.params;

  const { sprints, loading } = useSelector(state => state.sprints);

  const sprint = useMemo(() => collect(sprints).firstWhere("uuid", uuid), [
    sprints,
    uuid
  ]);
  const recentSprints = useMemo(
    () =>
      collect(sprints)
        .filter(({ finishedOn }) => sprint.finishedOn.isSameOrAfter(finishedOn))
        .take(sprintBreakdownCount)
        .all(),
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
          {tasks.map(({ uuid, name, mostRecentSprint }) => (
            <a
              key={uuid}
              href={`https://app.asana.com/0/${mostRecentSprint}/${uuid}/f`}
              rel="noopener noreferrer"
              target="_blank"
              className="btn btn-link text-left text-light p-0 d-block"
            >
              <li>
                <span className="pl-1 pr-1">{name}</span>
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </li>
            </a>
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
            <SprintBreakdown loading={loading} sprints={recentSprints} />
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

export default Report;
