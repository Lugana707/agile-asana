import React, { useMemo, useState, useEffect } from "react";
import { Jumbotron, Container, Dropdown } from "react-bootstrap";
import SprintTableDistributionCustomField from "../../../../components/sprint/tables/distributionCustomField";
import SprintCard from "../../../../components/sprint/sprintCard";
import withSprints from "../../../../components/sprint/withSprints";
import withForecastSprints from "../../../../components/backlog/withForecastSprints";

const Show = ({ sprints, forecastSprints }) => {
  const [minSprint, setMinSprint] = useState(false);
  const [maxSprint, setMaxSprint] = useState(false);

  const allSprints = useMemo(
    () => sprints.merge(forecastSprints.toArray()).sortByDesc("number"),
    [sprints, forecastSprints]
  );
  const filteredSprints = useMemo(
    () =>
      allSprints
        .when(minSprint !== false, collection =>
          collection.where("number", ">=", minSprint.number)
        )
        .when(maxSprint !== false, collection =>
          collection.where("number", "<=", maxSprint.number)
        ),
    [allSprints, minSprint, maxSprint]
  );

  const customFields = useMemo(
    () =>
      allSprints
        .pluck("tasks")
        .flatten(1)
        .pluck("customFields")
        .flatten(1)
        .unique("name")
        .sortBy("name"),
    [allSprints]
  );

  const [customField, setCustomField] = useState(customFields.first());

  useEffect(() => {
    if (!customField && customFields.isNotEmpty()) {
      setCustomField(customFields.first());
    }
  }, [customField, customFields]);

  return (
    <>
      <Jumbotron fluid>
        <Container>
          <h1>Reporting / Sprint / Effort Distribution</h1>
          <hr />
          <div>
            <span>Showing reports from </span>
            <Dropdown className="text-dark pr-2 text-capitalize d-inline">
              <Dropdown.Toggle>
                <span>Sprint </span>
                <span>
                  {minSprint
                    ? minSprint.number
                    : allSprints.pluck("number").min()}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {allSprints
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
                  {maxSprint
                    ? maxSprint.number
                    : allSprints.pluck("number").max()}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {allSprints
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
          </div>
        </Container>
      </Jumbotron>
      <Container>
        {customField &&
          filteredSprints.sortByDesc("number").map(sprint => (
            <SprintCard key={sprint.number} sprint={sprint}>
              <SprintTableDistributionCustomField
                sprint={sprint}
                customFieldName={customField.name}
              />
            </SprintCard>
          ))}
      </Container>
    </>
  );
};

export default withForecastSprints(withSprints(Show));
