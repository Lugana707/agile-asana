import React from "react";
import { Button, Card, ListGroup } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

const InfoCard = ({ sprint }) => {
  const {
    uuid,
    name,
    number,
    startOn,
    finishedOn,
    storyPoints,
    completedStoryPoints,
    averageCompletedStoryPoints,
    state
  } = sprint || {};

  return (
    <Card bg="dark" text="light" className="text-left">
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
      <ListGroup variant="flush">
        <ListGroup.Item variant="info">
          <span className="font-weight-bold">
            {averageCompletedStoryPoints}
          </span>
          <span> three week avg. story points</span>
        </ListGroup.Item>
        <ListGroup.Item
          variant={
            storyPoints <= averageCompletedStoryPoints ? "success" : "warning"
          }
        >
          <span className="font-weight-bold">{storyPoints}</span>
          <span> committed story points</span>
        </ListGroup.Item>
        <ListGroup.Item
          variant={completedStoryPoints >= storyPoints ? "success" : "danger"}
        >
          <span className="font-weight-bold">{completedStoryPoints}</span>
          <span> completed story points</span>
        </ListGroup.Item>
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
  );
};

export default InfoCard;
