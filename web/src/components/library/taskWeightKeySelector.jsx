import React, { useMemo } from "react";
import { withRouter } from "react-router-dom";
import { Button, ButtonGroup } from "react-bootstrap";

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

  const weightMap = [
    { key: "Count", value: "count", variant: "info" },
    { key: "Story Points", value: "storyPoints", variant: "info" }
  ];

  return (
    <ButtonGroup size="lg" vertical>
      {weightMap.map(({ key, value, variant }) => (
        <Button
          variant={variant}
          key={key}
          disabled={value === weightFromLocationSearch}
          onClick={() => setWeightInUrl(value)}
        >
          {key}
        </Button>
      ))}
    </ButtonGroup>
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
