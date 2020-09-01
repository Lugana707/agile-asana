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
import SprintWidgetGraphStoryPointsThroughWeek from "./_widgets/_graphStoryPointsThroughWeek";
import SprintWidgetGraphTagBreakdown from "./_widgets/_graphTagBreakdown";

const Show = ({ match }) => {
  const { uuid } = match.params;

  const { sprints } = useSelector(state => state.sprints);

  const sprintMemo = useMemo(() => collect(sprints).firstWhere("uuid", uuid), [
    sprints,
    uuid
  ]);

  if (!sprintMemo) {
    return <div className="loading-spinner centre" />;
  }

  const {
    name,
    number,
    startOn,
    dueOn,
    storyPoints,
    completedStoryPoints,
    averageCompletedStoryPoints,
    archived
  } = sprintMemo;

  return (
    <Container>
      <Row>
        <Col
          xs={{ order: "last", span: 12 }}
          md={{ order: "first", span: 12 }}
          className="pb-4"
        >
          <div className="h-100" style={{ minHeight: "300px" }}>
            <SprintWidgetGraphStoryPointsThroughWeek
              sprints={[sprintMemo]}
              showBurnUp={archived}
              showBurnDown={!archived}
            />
          </div>
        </Col>
        <Col xs={12} md={7}>
          <div className="h-100" style={{ minHeight: "300px " }}>
            <SprintWidgetGraphTagBreakdown sprints={[sprintMemo]} />
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
                  {archived ? (
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
                    {moment(dueOn).format("MMM D")}
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
              <LinkContainer to={`/sprint/${uuid}/task`}>
                <Button className="mr-2">Tasks</Button>
              </LinkContainer>
              <a
                href={`https://app.asana.com/0/${uuid}/board`}
                rel="noopener noreferrer"
                target="_blank"
                className="btn btn-secondary"
              >
                <span>Asana </span>
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
