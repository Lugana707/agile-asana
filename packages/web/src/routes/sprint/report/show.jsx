import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import AnchorLink from "react-anchor-link-smooth-scroll";
import { Container, Row, Col } from "react-bootstrap";
import collect from "collect.js";
import SprintBreakdown from "../../../components/sprint/tables/breakdown";
import SprintReleases from "../../../components/sprint/tables/releases";
import SprintJumbotron from "../../../components/sprint/jumbotron";
import SprintDistributionCustomField from "../../../components/sprint/tables/distributionCustomField";
import withSprints from "../../../components/sprint/withSprints";
import withSprintFromURL from "../../../components/sprint/withSprintFromURL";
import withConfigured from "../../../components/withConfigured";

const SPRINT_BREAKDOWN_COUNT = 5;

const Report = ({ sprint, sprints, configured }) => {
  const recentSprints = useMemo(
    () =>
      sprints
        .filter(({ finishedOn }) => sprint.finishedOn.isSameOrAfter(finishedOn))
        .take(SPRINT_BREAKDOWN_COUNT),
    [sprints, sprint]
  );

  const { tasks, tasksCompleted, customFieldNames } = sprint || {};

  const releases = useMemo(
    () =>
      sprint.releases.map(({ uuid, name, publishedAt }) => ({
        uuid,
        name: (
          <>
            <AnchorLink href="#releases">{name}</AnchorLink>
            <span className="pl-1">
              ({publishedAt.format("dddd, MMM Do @ LT")})
            </span>
          </>
        )
      })),
    [sprint.releases]
  );

  const unplannedWork = useMemo(
    () =>
      collect(tasks)
        .filter(({ tags }) => collect(tags).some("Unplanned"))
        .map(task => ({ ...task, to: `/task/${task.uuid}` })),
    [tasks]
  );
  const commitmentsMet = useMemo(
    () =>
      collect(tasksCompleted)
        .where("tags.length")
        .whereNotIn("uuid", unplannedWork.pluck("uuid").toArray())
        .map(task => ({ ...task, to: `/task/${task.uuid}` })),
    [tasksCompleted, unplannedWork]
  );
  const commitmentsMissed = useMemo(
    () =>
      collect(tasks)
        .where("tags.length")
        .whereNotIn("uuid", unplannedWork.pluck("uuid").toArray())
        .whereNotIn("uuid", commitmentsMet.pluck("uuid").toArray())
        .map(task => ({ ...task, to: `/task/${task.uuid}` })),
    [tasks, commitmentsMet, unplannedWork]
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
            <h1>Table of Contents</h1>
            <hr className="my-4" />
            <ol>
              <AnchorLink href="#comparison">
                <li>Comparison</li>
              </AnchorLink>
              <ol>
                <AnchorLink href="#sprintBreakdown">
                  <li>Sprint Breakdown</li>
                </AnchorLink>
              </ol>
              <AnchorLink href="#summary">
                <li>Summary</li>
                <ol>
                  {configured.github && <li>Releases</li>}
                  <li>Commitments Met</li>
                  <li>Commitments Missed</li>
                  <li>Unplanned Work</li>
                </ol>
              </AnchorLink>
              {customFieldNames.isNotEmpty() && (
                <>
                  <AnchorLink href="#effortDistribution">
                    <li>Effort Distribution</li>
                  </AnchorLink>
                  <ol>
                    {customFieldNames.map(name => (
                      <AnchorLink
                        key={name}
                        href={`#effortDistribution${name}`}
                      >
                        <li className="text-capitalize">{name}</li>
                      </AnchorLink>
                    ))}
                  </ol>
                </>
              )}
              {configured.github && (
                <AnchorLink href="#releases">
                  <li>Releases</li>
                </AnchorLink>
              )}
            </ol>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h1 id="comparison">Comparison</h1>
            <hr className="my-4" />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h2 id="sprintBreakdown">Sprint Breakdown</h2>
            <SprintBreakdown loading={!sprint} sprints={recentSprints} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h1 id="summary">Summary</h1>
            <hr className="my-4" />
          </Col>
          {configured.github && (
            <SummaryColumn
              title={<AnchorLink href="#releases">Releases</AnchorLink>}
              data={releases}
            />
          )}
          <SummaryColumn title="Commitments Met" data={commitmentsMet} />
          <SummaryColumn title="Commitments Missed" data={commitmentsMissed} />
          <SummaryColumn title="Unplanned Work" data={unplannedWork} />
        </Row>
        <Row>
          <Col xs={12}>
            <h1 id="effortDistribution">Effort Distribution</h1>
            <hr className="my-4" />
          </Col>
          {customFieldNames.map(name => (
            <Col key={name} xs={12}>
              <h2 id={`effortDistribution${name}`} className="text-capitalize">
                {name}
              </h2>
              <SprintDistributionCustomField
                sprint={sprint}
                customFieldName={name}
              />
            </Col>
          ))}
        </Row>
        {configured.github && (
          <Row>
            <Col xs={12}>
              <h1 id="releases">Releases ({sprint.releases.count()})</h1>
              <hr className="my-4" />
            </Col>
            <Col xs={12}>
              <SprintReleases sprint={sprint} />
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default withConfigured(withSprintFromURL(withSprints(Report)));
