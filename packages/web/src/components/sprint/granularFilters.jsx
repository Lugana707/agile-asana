import React, { useMemo, useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";

const GranularFilters = ({
  sprints,
  customField,
  setCustomField,
  setFilteredSprints
}) => {
  const [minSprint, setMinSprint] = useState(false);
  const [maxSprint, setMaxSprint] = useState(false);

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

  useEffect(() => {
    if (!customField && customFields.isNotEmpty()) {
      setCustomField(customFields.first());
    }
  }, [customField, customFields, setCustomField]);

  useEffect(() => {
    setFilteredSprints(
      sprints
        .when(minSprint !== false, collection =>
          collection.where("number", ">=", minSprint.number)
        )
        .when(maxSprint !== false, collection =>
          collection.where("number", "<=", maxSprint.number)
        )
    );
  }, [setFilteredSprints, sprints, minSprint, maxSprint]);

  return (
    <>
      <span>Showing reports from </span>
      <Dropdown className="text-dark pr-2 text-capitalize d-inline">
        <Dropdown.Toggle>
          <span>Sprint </span>
          <span>
            {minSprint ? minSprint.number : sprints.pluck("number").min()}
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {sprints
            .when(maxSprint !== false, collection =>
              collection.where("number", "<", maxSprint.number)
            )
            .map(obj => (
              <Dropdown.Item
                key={obj.number}
                onSelect={() => setMinSprint(obj)}
                disabled={obj.number === minSprint.number}
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
          <span>
            {maxSprint ? maxSprint.number : sprints.pluck("number").max()}
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {sprints
            .when(minSprint !== false, collection =>
              collection.where("number", ">", minSprint.number)
            )
            .map(obj => (
              <Dropdown.Item
                key={obj.number}
                onSelect={() => setMaxSprint(obj)}
                disabled={obj.number === maxSprint.number}
              >
                Sprint {obj.number}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
      <span>based on </span>
      <Dropdown className="text-dark pr-2 text-capitalize d-inline">
        <Dropdown.Toggle variant="primary">
          {customField && customField.name}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {customFields.map(obj => (
            <Dropdown.Item
              key={obj.name}
              onSelect={() => setCustomField(obj)}
              disabled={customField && obj.name === customField.name}
            >
              {obj.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default GranularFilters;
