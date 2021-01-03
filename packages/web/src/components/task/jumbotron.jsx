import React from "react";
import { withRouter } from "react-router-dom";
import {
  Jumbotron,
  Container,
  Button,
  ToggleButtonGroup,
  ToggleButton
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";

const TaskJumobtron = ({ task, title, children, location, history }) => {
  const { pathname } = location;

  const { uuid, name, externalLink, subtasks } = task;

  const links = collect([
    { title: "Summary", url: "" },
    subtasks.isNotEmpty() && { title: "Forecast", url: "forecast" }
  ])
    .where()
    .map(({ url, ...obj }) => ({
      ...obj,
      url: `/task/${uuid}/${url}`
    }))
    .map(obj => ({ ...obj, disabled: pathname === obj.url }));

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
        <ToggleButtonGroup
          as="p"
          name="sprintPageRadio"
          size="sm"
          type="radio"
          value={pathname}
          onChange={url => history.push(url)}
        >
          {links.map(({ title, url, disabled }, index) => (
            <ToggleButton
              key={index}
              value={url}
              variant="dark"
              checked={url === pathname}
            >
              {title}
            </ToggleButton>
          ))}
          {externalLink && (
            <Button variant="dark">
              <a
                href={externalLink}
                rel="noopener noreferrer"
                target="_blank"
                className="text-light"
                style={{ textDecoration: "none" }}
              >
                <span>View in Asana</span>
                <span className="pl-2">
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </span>
              </a>
            </Button>
          )}
        </ToggleButtonGroup>
        {children && <p>{children}</p>}
      </Container>
    </Jumbotron>
  );
};

export default withRouter(TaskJumobtron);
