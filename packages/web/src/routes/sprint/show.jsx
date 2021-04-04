import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import SprintBurnDown from "../../components/sprint/charts/burnDown";
import SprintTagsBarChart from "../../components/sprint/charts/sprintTagsBarChart";
import SprintTimeProgress from "../../components/sprint/timeProgress";
import SprintStoryPointProgress from "../../components/sprint/storyPointProgress";
import SprintInfoCard from "../../components/sprint/infoCard";
import BacklogAggregateRaised from "../../components/backlog/widgets/aggregateRaised";
import BacklogProgressForSprint from "../../components/backlog/charts/progressForSprint";
import withSprintFromURL from "../../components/sprint/withSprintFromURL";
import SprintJumbotron from "../../components/sprint/jumbotron";

const Show = ({ sprint }) => {
  const { startOn, finishedOn, state } = sprint || {};

  const isComplete = useMemo(() => state === "COMPLETED", [state]);

  if (!sprint) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <>
      <SprintJumbotron sprint={sprint} title="Dashboard" />
      <Container>
        <Row>
          <Col xs={{ span: 12, order: 0 }} md={12} className="pb-4">
            <SprintBurnDown sprint={sprint} />
          </Col>
          <Col xs={{ span: 12, order: 1 }} className="pb-4">
            <SprintStoryPointProgress sprint={sprint} />
            {!isComplete && (
              <SprintTimeProgress className="mt-1" sprint={sprint} />
            )}
          </Col>
          <Col xs={{ span: 12, order: 3 }} md={5} className="pb-4">
            <SprintInfoCard sprint={sprint} showSummary showLinks />
          </Col>
          <Col xs={{ span: 12, order: 4 }} md={7} className="pb-4 d-block">
            <SprintTagsBarChart sprint={sprint} />
          </Col>
          <Col md={{ span: 12, order: 5 }} className="d-hidden d-md-block">
            <hr />
          </Col>
          <Col
            xs={{ span: 12, order: 7 }}
            md={{ span: 7, order: 6 }}
            className="pb-4 d-block"
          >
            <BacklogProgressForSprint sprint={sprint} />
          </Col>
          <Col
            xs={{ span: 12, order: 6 }}
            md={{ span: 5, order: 7 }}
            className="pb-4"
          >
            <BacklogAggregateRaised
              dateFrom={startOn}
              dateTo={finishedOn}
              includeTag={["bug", "feature"]}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withSprintFromURL(Show);
