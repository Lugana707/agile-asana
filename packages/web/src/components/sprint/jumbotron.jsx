import React from "react";
import { withRouter, Link } from "react-router-dom";
import {
  Jumbotron,
  Container,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Dropdown
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";
import withSprints from "./withSprints";

const SprintJumobtron = ({
  sprint,
  sprints,
  title,
  children,
  location,
  history
}) => {
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
        <Dropdown className="btn-link text-dark float-left pr-2">
          <Dropdown.Toggle as="h1">Sprint {number}</Dropdown.Toggle>
          <Dropdown.Menu>
            {sprints.map(sprint => (
              <Dropdown.Item
                key={sprint.uuid}
                as={Link}
                to={`/sprint/${sprint.uuid}/${pathname.replace(
                  /^\/(sprint)\/(\d+)(\/?)/iu,
                  ""
                )}`}
                disabled={sprint.uuid === uuid}
              >{`Sprint ${sprint.number}`}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <h1>
          <span className="text-muted"> | </span>
          <span>{title}</span>
        </h1>
        <div className="clearfix" />
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

export default withRouter(withSprints(SprintJumobtron));
