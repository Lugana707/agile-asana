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
import ProjectWidgetGraphStoryPointsThroughWeek from "../project/_widgets/_graphStoryPointsThroughWeek";

const Show = ({ match }) => {
  const { projectGid } = match.params;
  const projectGidMemo = useMemo(() => decodeURIComponent(projectGid), [
    projectGid
  ]);

  const { asanaProjectTasks } = useSelector(state => state.asanaProjectTasks);
  const sprintsMemo = useMemo(
    () => (asanaProjectTasks || []).filter(({ gid }) => gid === projectGidMemo),
    [asanaProjectTasks, projectGidMemo]
  );

  const [sprint] = sprintsMemo;

  if (!sprint) {
    return <div className="loading-spinner centre" />;
  }

  const {
    name,
    week,
    committedStoryPoints,
    completedStoryPoints,
    runningAverageCompletedStoryPoints
  } = sprint;

  return (
    <Container>
      <Row>
        <Col xs={{ order: "last", span: 12 }} md={{ order: "first" }}>
          <div className="h-100" style={{ minHeight: "300px" }}>
            <ProjectWidgetGraphStoryPointsThroughWeek sprints={sprintsMemo} />
          </div>
        </Col>
        <Col
          xs={{ order: "first", span: 12 }}
          md={{ order: "last", span: 5 }}
          className="pb-4"
        >
          <Card bg="dark" text="light" className="text-left h-100">
            <Card.Body>
              <Card.Title>Sprint {week}</Card.Title>
              <Card.Subtitle className="text-muted">{name}</Card.Subtitle>
            </Card.Body>
            <ListGroup className="list-group-flush">
              <ListGroupItem variant="info">
                <span className="font-weight-bold">
                  {runningAverageCompletedStoryPoints}
                </span>
                <span> three week avg. story points</span>
              </ListGroupItem>
              <ListGroupItem
                variant={
                  committedStoryPoints <= runningAverageCompletedStoryPoints
                    ? "success"
                    : "warning"
                }
              >
                <span className="font-weight-bold">{committedStoryPoints}</span>
                <span> committed story points</span>
              </ListGroupItem>
              <ListGroupItem
                variant={
                  completedStoryPoints >= committedStoryPoints
                    ? "success"
                    : "danger"
                }
              >
                <span className="font-weight-bold">{completedStoryPoints}</span>
                <span> completed story points</span>
              </ListGroupItem>
            </ListGroup>

            <Card.Footer>
              <LinkContainer to={`/project/${projectGidMemo}/task`}>
                <Button className="mr-2">Tasks</Button>
              </LinkContainer>
              <a
                href={`https://app.asana.com/0/${projectGidMemo}/board`}
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
