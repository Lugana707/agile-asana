import React from "react";
import { withRouter } from "react-router-dom";
import {
  Jumbotron,
  Container,
  ToggleButtonGroup,
  ToggleButton,
  Button
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";

const SprintJumobtron = ({ sprint, title, children, location, history }) => {
  const { pathname } = location;

  const { number, uuid } = sprint;

  const links = collect([
    { title: "Home", url: "" },
    { title: "Tasks", url: "task" },
    { title: "Report", url: "report" }
  ])
    .map(({ url, ...obj }) => ({
      ...obj,
      url: `/sprint/${uuid}/${url}`
    }))
    .map(obj => ({ ...obj, disabled: pathname === obj.url }));

  return (
    <Jumbotron fluid>
      <Container>
        <h1>
          <span>Sprint {number}</span>
          {title && (
            <>
              <span className="text-muted"> | </span>
              <span>{title}</span>
            </>
          )}
        </h1>
        <hr />
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
          <Button variant="dark">
            <a
              href={`https://app.asana.com/0/${uuid}/board`}
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
        </ToggleButtonGroup>
        {children && <p>{children}</p>}
      </Container>
    </Jumbotron>
  );
};

export default withRouter(SprintJumobtron);
