import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Jumbotron, Container, Button, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

const TaskJumobtron = ({ task, title, children, history }) => {
  const { name, uuid, mostRecentSprint } = task;

  return (
    <Jumbotron fluid className="bg-primary">
      <Container>
        <h1>
          <span>Task</span>
          {title && (
            <>
              <span className="text-muted"> | </span>
              <span>{title}</span>
            </>
          )}
        </h1>
        <hr />
        <p>{name}</p>
        <ButtonGroup as="p">
          <LinkContainer to={`/sprint/${mostRecentSprint}`}>
            <Button variant="dark" size="sm">
              Recent Sprint
            </Button>
          </LinkContainer>
          <a
            href={`https://app.asana.com/0/${mostRecentSprint}/${uuid}/f`}
            rel="noopener noreferrer"
            target="_blank"
            className="btn btn-dark btn-sm"
          >
            <span>View in Asana</span>
            <span className="pl-2">
              <FontAwesomeIcon icon={faExternalLinkAlt} />
            </span>
          </a>
        </ButtonGroup>
        {children && <p>{children}</p>}
      </Container>
    </Jumbotron>
  );
};

export default TaskJumobtron;
