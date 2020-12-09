import React, { useMemo } from "react";
import { withRouter } from "react-router-dom";
import {
  Button,
  ButtonGroup,
  Dropdown,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import collect from "collect.js";

const getTaskWeightKeyFromURL = ({ search }) =>
  new URLSearchParams(search).get("weight") || "storyPoints";

const TaskWeightKeySelector = ({ history }) => {
  const { location } = history;

  const weightFromLocationSearch = useMemo(
    () => getTaskWeightKeyFromURL(location),
    [location]
  );

  const setWeightInUrl = weight => {
    const urlSearchParams = new URLSearchParams(location.search);
    urlSearchParams.set("weight", weight);
    history.push(`${location.pathname}?${urlSearchParams.toString()}`);
  };

  const weightMap = collect([
    { key: "Count", value: "count", variant: "info" },
    { key: "Story Points", value: "storyPoints", variant: "info" }
  ]);

  const Description = ({ children, ...props }) => {
    const TasksWeightedByTooltip = props => (
      <Tooltip {...props}>
        e.g. "count" will display the number of backlog tasks, as opposed to
        displaying the sum of their "story points"
      </Tooltip>
    );

    return (
      <div {...props}>
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={TasksWeightedByTooltip}
        >
          <span>
            <span>Tasks Weighted by</span>
            {children}
            <FontAwesomeIcon className="ml-1" icon={faInfoCircle} />
          </span>
        </OverlayTrigger>
      </div>
    );
  };

  const weightIsActive = weight => weight === weightFromLocationSearch;

  return (
    <>
      <Dropdown className="d-md-none">
        <Dropdown.Toggle variant="info" id="dropdown-basic">
          <Description>
            <span className="pl-1">
              {weightMap.firstWhere("value", weightFromLocationSearch).key}
            </span>
          </Description>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {weightMap
            .where("value", "!==", weightFromLocationSearch)
            .map(({ key, value, variant }) => (
              <Dropdown.Item
                variant={variant}
                key={key}
                onClick={() => setWeightInUrl(value)}
              >
                {key}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
      <ButtonGroup className="d-none d-md-block" size="md" vertical>
        <Description className="p-2 bg-secondary rounded-top" />
        {weightMap.map(({ key, value, variant }) => (
          <Button
            variant={variant}
            disabled={weightIsActive(value)}
            key={key}
            onClick={() => setWeightInUrl(value)}
          >
            {key}
            {weightIsActive(value) && (
              <FontAwesomeIcon className="ml-1 mr-1" icon={faCheckCircle} />
            )}
          </Button>
        ))}
      </ButtonGroup>
    </>
  );
};

export const withTaskWeightKeyFromURL = WrappedComponent => props => {
  const { location } = props;

  const taskWeightKey = useMemo(() => getTaskWeightKeyFromURL(location), [
    location
  ]);

  return <WrappedComponent {...props} taskWeightKey={taskWeightKey} />;
};

export default withRouter(TaskWeightKeySelector);
