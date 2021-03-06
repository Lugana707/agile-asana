import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  ListGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

const InfoCard = ({ sprint, showSummary, showLinks }) => {
  const {
    uuid,
    name,
    startOn,
    finishedOn,
    storyPoints,
    completedStoryPoints,
    averageCompletedStoryPoints,
    state,
    externalLink
  } = sprint || {};

  const completed = useMemo(() => state === "COMPLETED", [state]);

  const AverageCompletedStoryPointsTooltipWrapper = ({ children }) => {
    if (!completed) {
      const AverageCompletedStoryPointsTooltip = props => (
        <Tooltip {...props}>
          {
            "calculated using this sprint's committed story points and the previous two sprints' completed story points"
          }
        </Tooltip>
      );

      return (
        <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 400 }}
          overlay={AverageCompletedStoryPointsTooltip}
        >
          <span>
            <span className="font-italic mr-1">{children}</span>
            <FontAwesomeIcon icon={faInfoCircle} />
          </span>
        </OverlayTrigger>
      );
    }

    return children;
  };

  return (
    <Card bg="dark" text="light" className="text-left">
      <Card.Body>
        <Card.Title>
          <Link as={Button} to={`/sprint/${uuid}`} variant="link">
            <span className="text-light text-nowrap pr-1">{name}</span>
            <span className="d-inline-block">
              {completed ? (
                <span className="text-success">Completed</span>
              ) : (
                <span className="text-warning">(In&nbsp;Progress)</span>
              )}
            </span>
            {completed && !showSummary && (
              <span className="text-muted float-right">
                {completedStoryPoints} / {storyPoints}
              </span>
            )}
          </Link>
        </Card.Title>
        <hr />
        <Card.Subtitle className="text-muted">
          <span className="d-block">
            <span className="font-weight-bold">
              {moment(startOn).format("MMM D")}
            </span>
            <span> to </span>
            <span className="font-weight-bold">
              {moment(finishedOn).format("MMM D")}
            </span>
            {!showSummary && (
              <span
                className={`float-right ${completed ? "" : "text-warning"}`}
              >
                {Math.floor((completedStoryPoints / storyPoints) * 100)}%
              </span>
            )}
          </span>
        </Card.Subtitle>
      </Card.Body>
      {showSummary && (
        <ListGroup variant="flush">
          <ListGroup.Item variant="info">
            <AverageCompletedStoryPointsTooltipWrapper>
              <span className="font-weight-bold">
                {averageCompletedStoryPoints}
              </span>
              <span> three week avg.</span>
            </AverageCompletedStoryPointsTooltipWrapper>
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
      )}
      {showLinks && (
        <Card.Footer className="text-right">
          <Button
            as={Link}
            to={`/sprint/${uuid}/report`}
            size="sm"
            className="mr-1"
          >
            Report
          </Button>
          <Button
            as={Link}
            to={`/sprint/${uuid}/task`}
            size="sm"
            className="mr-1"
            hidden
          >
            Tasks
          </Button>
          {externalLink && (
            <a
              href={externalLink}
              rel="noopener noreferrer"
              target="_blank"
              className="btn btn-secondary btn-sm"
            >
              <span className="pr-1">Asana</span>
              <FontAwesomeIcon icon={faExternalLinkAlt} />
            </a>
          )}
        </Card.Footer>
      )}
    </Card>
  );
};

export default InfoCard;
