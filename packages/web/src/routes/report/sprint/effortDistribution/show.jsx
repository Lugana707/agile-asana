import React, { useMemo, useState, useEffect } from "react";
import { Jumbotron, Container, Dropdown } from "react-bootstrap";
import SprintChartDistributionCustomField from "../../../../components/sprint/charts/distributionCustomField";
import SprintCard from "../../../../components/sprint/sprintCard";
import withSprints from "../../../../components/sprint/withSprints";
import withForecastSprints from "../../../../components/backlog/withForecastSprints";

const Show = ({ sprints, forecastSprints }) => {
  const allSprints = useMemo(
    () =>
      sprints
        .merge(forecastSprints.toArray())
        .sortByDesc("number")
        .dump(),
    [sprints, forecastSprints]
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
            <span>Showing reports based on </span>
            {customField && customFields.isNotEmpty() && (
              <Dropdown className="btn-link text-dark pr-2 text-capitalize d-inline">
                <Dropdown.Toggle as="span">{customField.name}</Dropdown.Toggle>
                <Dropdown.Menu>
                  {customFields.map(obj => (
                    <Dropdown.Item
                      key={obj.name}
                      onSelect={() => setCustomField(obj)}
                      disabled={obj.name === customField.name}
                    >
                      {obj.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Container>
      </Jumbotron>
      <Container>
        {customField &&
          allSprints.map(sprint => (
            <SprintCard key={sprint.number} sprint={sprint}>
              <SprintChartDistributionCustomField
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
