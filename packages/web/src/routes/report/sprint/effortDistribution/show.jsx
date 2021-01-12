import React, { useMemo, useState } from "react";
import { Jumbotron, Container } from "react-bootstrap";
import SprintTableDistributionCustomField from "../../../../components/sprint/tables/distributionCustomField";
import SprintCard from "../../../../components/sprint/sprintCard";
import withSprints from "../../../../components/sprint/withSprints";
import withForecastSprints from "../../../../components/backlog/withForecastSprints";
import SprintGranularFilters from "../../../../components/sprint/granularFilters";

const Show = ({ sprints, forecastSprints }) => {
  const [customField, setCustomField] = useState(false);

  const [filteredSprints, setFilteredSprints] = useState(false);

  const allSprints = useMemo(
    () => sprints.merge(forecastSprints.toArray()).sortByDesc("number"),
    [sprints, forecastSprints]
  );

  return (
    <>
      <Jumbotron fluid>
        <Container>
          <h1>Reporting / Sprint / Effort Distribution</h1>
          <hr />
          <div>
            <SprintGranularFilters
              sprints={allSprints}
              customField={customField}
              setCustomField={setCustomField}
              setFilteredSprints={setFilteredSprints}
            />
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
