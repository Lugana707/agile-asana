import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import collect from "collect.js";
import SprintBurnUpDown from "../../components/sprint/charts/burnUpDown";
import SprintTagsBarChart from "../../components/sprint/charts/sprintTagsBarChart";
import SprintTimeProgress from "../../components/sprint/timeProgress";
import SprintStoryPointProgress from "../../components/sprint/storyPointProgress";
import SprintInfoCard from "../../components/sprint/infoCard";
import BacklogAggregateRaised from "../../components/backlog/widgets/aggregateRaised";

const Show = ({ match }) => {
  const { uuid } = match.params;

  const { sprints } = useSelector(state => state.sprints);

  const sprint = useMemo(() => collect(sprints).firstWhere("uuid", uuid), [
    sprints,
    uuid
  ]);

  const { startOn, finishedOn, state } = sprint || {};

  const isComplete = useMemo(() => state === "COMPLETED", [state]);

  if (!sprint) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <Container>
      <Row>
        <Col xs={12} md={12} className="pb-4">
          <div className="h-100" style={{ minHeight: "300px" }}>
            <SprintBurnUpDown sprint={sprint} />
          </div>
        </Col>
        <Col xs={12} className="pb-4">
          <SprintStoryPointProgress sprint={sprint} />
          {!isComplete && (
            <SprintTimeProgress className="mt-1" sprint={sprint} />
          )}
        </Col>
        <Col xs={12} md={7} className="pb-4 d-block">
          <BacklogAggregateRaised
            dateFrom={startOn}
            dateTo={finishedOn}
            includeTag={["bug", "feature"]}
          />
        </Col>
        <Col xs={12} md={5} className="pb-4">
          <SprintInfoCard sprint={sprint} />
        </Col>
        <Col xs={{ size: 12, order: "last" }} md={12}>
          <div className="h-100" style={{ minHeight: "300px " }}>
            <SprintTagsBarChart sprint={sprint} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Show;
