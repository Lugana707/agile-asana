import React, { useMemo, useEffect, useCallback } from "react";
import { withRouter } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

const getMinSprintNumberFromURL = location =>
  new URLSearchParams(location.search).get("minSprint");
const getMaxSprintNumberFromURL = location =>
  new URLSearchParams(location.search).get("maxSprint");

const getCustomFieldNameFromURL = location =>
  new URLSearchParams(location.search).get("customField");

const GranularFilters = ({ history, sprints }) => {
  const { location } = history;

  const sortedSprints = useMemo(() => sprints.sortByDesc("number"), [sprints]);

  const minSprintNumber = useMemo(
    () => getMinSprintNumberFromURL(location) || sprints.pluck("number").min(),
    [location, sprints]
  );
  const setMinSprint = ({ number }) => setURLParam("minSprint", number);

  const maxSprintNumber = useMemo(
    () => getMaxSprintNumberFromURL(location) || sprints.pluck("number").max(),
    [location, sprints]
  );
  const setMaxSprint = ({ number }) => setURLParam("maxSprint", number);

  const setURLParam = useCallback(
    (key, value) => {
      const { pathname, search } = location;

      const urlSearchParams = new URLSearchParams(search);

      urlSearchParams.set(key, value);

      history.push(`${pathname}?${urlSearchParams.toString()}`);
    },
    [location, history]
  );

  const customFields = useMemo(
    () =>
      sprints
        .pluck("tasks")
        .flatten(1)
        .pluck("customFields")
        .flatten(1)
        .unique("name")
        .sortBy("name"),
    [sprints]
  );

  const customFieldName = useMemo(() => getCustomFieldNameFromURL(location), [
    location
  ]);
  const setCustomField = useCallback(
    ({ name }) => setURLParam("customField", name),
    [setURLParam]
  );

  useEffect(() => {
    if (!customFieldName && customFields.isNotEmpty()) {
      setCustomField(customFields.first());
    }
  }, [customFieldName, customFields, setCustomField]);

  return (
    <>
      <span>Showing reports from </span>
      <Dropdown className="text-dark pr-2 text-capitalize d-inline">
        <Dropdown.Toggle>
          <span>Sprint </span>
          <span>{minSprintNumber}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {sortedSprints
            .when(maxSprintNumber, collection =>
              collection.where("number", "<", maxSprintNumber)
            )
            .map(obj => (
              <Dropdown.Item
                key={obj.number}
                onSelect={() => setMinSprint(obj)}
                disabled={obj.number.toString() === minSprintNumber}
              >
                Sprint {obj.number}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
      <span>to </span>
      <Dropdown className="text-dark pr-2 text-capitalize d-inline">
        <Dropdown.Toggle>
          <span>Sprint </span>
          <span>{maxSprintNumber}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {sortedSprints
            .when(minSprintNumber, collection =>
              collection.where("number", ">", minSprintNumber)
            )
            .map(obj => (
              <Dropdown.Item
                key={obj.number}
                onSelect={() => setMaxSprint(obj)}
                disabled={obj.number.toString() === maxSprintNumber}
              >
                Sprint {obj.number}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
      <span>based on </span>
      <Dropdown className="text-dark pr-2 text-capitalize d-inline">
        <Dropdown.Toggle variant="primary">{customFieldName}</Dropdown.Toggle>
        <Dropdown.Menu>
          {customFields.map(obj => (
            <Dropdown.Item
              key={obj.name}
              onSelect={() => setCustomField(obj)}
              disabled={obj.name === customFieldName}
            >
              {obj.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export const withSprintFiltersFromURL = WrappedComponent =>
  withRouter(props => {
    const { location } = props;

    const minSprintNumberFromURL = useMemo(
      () => getMinSprintNumberFromURL(location),
      [location]
    );
    const maxSprintNumberFromURL = useMemo(
      () => getMaxSprintNumberFromURL(location),
      [location]
    );

    const customFieldNameFromUrl = useMemo(
      () => getCustomFieldNameFromURL(location),
      [location]
    );

    return (
      <WrappedComponent
        {...props}
        minSprintNumber={minSprintNumberFromURL}
        maxSprintNumber={maxSprintNumberFromURL}
        customFieldName={customFieldNameFromUrl}
      />
    );
  });

export default withRouter(GranularFilters);
