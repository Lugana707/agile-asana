import React from "react";
import { Link } from "react-router-dom";
import { Jumbotron, Container, Button, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

const TaskJumobtron = ({ task, title, children, history }) => {
  const { name, mostRecentSprint, externalLink } = task;

  return (
    <Jumbotron fluid>
      <Container>
        <h1>
          <span>{name}</span>
          {title && (
            <>
              <span className="text-muted"> | </span>
              <span>{title}</span>
            </>
          )}
        </h1>
        <hr />
        <p className="alert alert-warning text-dark">Work in Progress!</p>
        <ButtonGroup as="p">
          <Button
            as={Link}
            to={`/sprint/${mostRecentSprint}`}
            variant="dark"
            size="sm"
          >
            Recent Sprint
          </Button>
          {externalLink && (
            <a
              href={externalLink}
              rel="noopener noreferrer"
              target="_blank"
              className="btn btn-dark btn-sm"
            >
              <span>View in Asana</span>
              <span className="pl-2">
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </span>
            </a>
          )}
        </ButtonGroup>
        {children && <p>{children}</p>}
      </Container>
    </Jumbotron>
  );
};

export default TaskJumobtron;
