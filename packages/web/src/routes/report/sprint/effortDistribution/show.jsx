import React, { useMemo } from "react";
import { Jumbotron, Container } from "react-bootstrap";
import SprintCard from "../../../../components/sprint/sprintCard";
import withSprints from "../../../../components/sprint/withSprints";
import withForecastSprints from "../../../../components/backlog/withForecastSprints";
import SprintGranularFilters, {
  withSprintFiltersFromURL
} from "../../../../components/sprint/granularFilters";

const Show = ({
  sprints,
  forecastSprints,
  minSprintNumber,
  maxSprintNumber,
  customFieldName
}) => {
  const allSprints = useMemo(() => sprints.merge(forecastSprints.toArray()), [
    sprints,
    forecastSprints
  ]);

  const filteredSprints = useMemo(
    () =>
      allSprints
        .when(minSprintNumber, collection =>
          collection.where("number", ">=", minSprintNumber)
        )
        .when(maxSprintNumber, collection =>
          collection.where("number", "<=", maxSprintNumber)
        )
        .sortByDesc("number"),
    [allSprints, minSprintNumber, maxSprintNumber]
  );

  return (
    <>
      <Jumbotron fluid className="sticky-top">
        <Container>
          <h1>Reporting / Sprint / Effort Distribution</h1>
          <hr />
          <div>
            <SprintGranularFilters sprints={allSprints} />
          </div>
        </Container>
      </Jumbotron>
      <Container>
        {customFieldName &&
          filteredSprints
            .sortByDesc("number")
            .map(sprint => (
              <SprintCard
                key={sprint.number}
                sprint={sprint}
                customFieldName={customFieldName}
                defaultView="distribution"
                noChangeView
              />
            ))}
      </Container>
    </>
  );
};

export default withForecastSprints(withSprints(withSprintFiltersFromURL(Show)));
