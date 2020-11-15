import React, { useMemo } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  ListGroupItem
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import moment from "moment";
import collect from "collect.js";
import SprintWidgetGraphStoryPointsThroughSprint from "../../components/sprint/widgets/graphStoryPointsThroughSprint";
import SprintWidgetGraphTagBreakdown from "../../components/sprint/widgets/graphTagBreakdown";
import SprintTimeProgress from "../../components/sprint/timeProgress";
import SprintStoryPointProgress from "../../components/sprint/storyPointProgress";

const Show = ({ match }) => {
  const { uuid } = match.params;

  const { sprints } = useSelector(state => state.sprints);

  const sprint = useMemo(() => collect(sprints).firstWhere("uuid", uuid), [
    sprints,
    uuid
  ]);

  const {
    name,
    number,
    startOn,
    finishedOn,
    storyPoints,
    completedStoryPoints,
    averageCompletedStoryPoints,
    state
  } = sprint || {};

  const isComplete = useMemo(() => state === "COMPLETED", [state]);

  if (!sprint) {
    return <div className="loading-spinner centre" />;
  }

  return (
    <Container>
      <Row>
        <Col
          xs={{ order: "last", span: 12 }}
          md={{ order: "first", span: 12 }}
          className="pb-4"
        >
          <div className="h-100" style={{ minHeight: "300px" }}>
            <SprintWidgetGraphStoryPointsThroughSprint
              sprints={[sprint]}
              showBurnUp={isComplete}
              showBurnDown={state === "ACTIVE"}
            />
          </div>
        </Col>
        <Col xs={12} className="pb-4">
          <SprintStoryPointProgress sprint={sprint} />
          {!isComplete && (
            <SprintTimeProgress className="mt-1" sprint={sprint} />
          )}
        </Col>
        <Col xs={12} md={7}>
          <div className="h-100" style={{ minHeight: "300px " }}>
            <SprintWidgetGraphTagBreakdown sprints={[sprint]} />
          </div>
        </Col>
        <Col
          xs={{ order: "first", span: 12 }}
          md={{ order: "last", span: 5 }}
          className="pb-4"
        >
          <Card bg="dark" text="light" className="text-left h-100">
            <Card.Body>
              <Card.Title>
                <span>
                  <span>Sprint {number}</span>
                  {state === "COMPLETED" ? (
                    <span className="text-success"> Completed</span>
                  ) : (
                    <span className="text-warning"> (In Progress)</span>
                  )}
                </span>
              </Card.Title>
              <Card.Subtitle className="text-muted">
                <span className="d-block">{name}</span>
                <hr />
                <span className="d-block">
                  <span className="font-weight-bold">
                    {moment(startOn).format("MMM D")}
                  </span>
                  <span> to </span>
                  <span className="font-weight-bold">
                    {moment(finishedOn).format("MMM D")}
                  </span>
                </span>
              </Card.Subtitle>
            </Card.Body>
            <ListGroup className="list-group-flush">
              <ListGroupItem variant="info">
                <span className="font-weight-bold">
                  {averageCompletedStoryPoints}
                </span>
                <span> three week avg. story points</span>
              </ListGroupItem>
              <ListGroupItem
                variant={
                  storyPoints <= averageCompletedStoryPoints
                    ? "success"
                    : "warning"
                }
              >
                <span className="font-weight-bold">{storyPoints}</span>
                <span> committed story points</span>
              </ListGroupItem>
              <ListGroupItem
                variant={
                  completedStoryPoints >= storyPoints ? "success" : "danger"
                }
              >
                <span className="font-weight-bold">{completedStoryPoints}</span>
                <span> completed story points</span>
              </ListGroupItem>
            </ListGroup>
            <Card.Footer className="text-right">
              <LinkContainer to={`/sprint/${uuid}/report`}>
                <Button size="sm" className="mr-1">
                  Report
                </Button>
              </LinkContainer>
              <LinkContainer to={`/sprint/${uuid}/task`}>
                <Button size="sm" className="mr-1" hidden>
                  Tasks
                </Button>
              </LinkContainer>
              <a
                href={`https://app.asana.com/0/${uuid}/board`}
                rel="noopener noreferrer"
                target="_blank"
                className="btn btn-secondary btn-sm"
              >
                <span className="pr-1">Asana</span>
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </a>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Show;
