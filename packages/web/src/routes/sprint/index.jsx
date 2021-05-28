import React, { useState, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import SprintFilter from "../../components/sprint/filter";
import SprintInfoCard from "../../components/sprint/infoCard";
import SprintTagsAreaChart from "../../components/sprint/charts/sprintTagsAreaChart";
import SprintStoryPointPerDay from "../../components/sprint/charts/storyPointsPerDay";
import withSprintsCombined from "../../components/sprint/withSprintsCombined";

const Sprints = ({ sprints, sprintsCombined }) => {
  const [filteredSprints, setFilteredSprints] = useState(false);

  const sprintsForDisplay = useMemo(
    () =>
      filteredSprints && filteredSprints.isNotEmpty()
        ? sprints
            .whereIn("number", filteredSprints.pluck("number").toArray())
            .toArray()
        : [],
    [filteredSprints, sprints]
  );

  const SprintFilters = () => (
    <Col xs={12} className="pb-4">
      <SprintFilter
        defaultCount={20}
        sprints={sprintsCombined}
        setSprints={setFilteredSprints}
      />
    </Col>
  );

  const SprintsList = () =>
    sprints.map(sprint => (
      <Col key={sprint.uuid} xs={12} md={6} lg={4} className="pb-4">
        <SprintInfoCard sprint={sprint} />
      </Col>
    ));

  return (
    <Container className="pt-4">
      <Row>
        <SprintsList />
      </Row>
      {false && (
        <Tabs>
          <TabList>
            <Row>
              <Tab>All Sprints</Tab>
              <Tab>Story Points Per Day</Tab>
              <Tab>Tags Over Time</Tab>
            </Row>
          </TabList>
          <TabPanel>
            <Row>
              <SprintsList />
            </Row>
          </TabPanel>
          <TabPanel>
            <Row>
              <Col style={{ height: "50vh" }}>
                <SprintFilters />
                {sprintsForDisplay.length && (
                  <SprintStoryPointPerDay sprints={sprintsForDisplay} />
                )}
              </Col>
            </Row>
          </TabPanel>
          <TabPanel>
            <Row>
              <Col style={{ height: "50vh" }}>
                <SprintFilters />
                {sprintsForDisplay.length && (
                  <SprintTagsAreaChart sprints={sprintsForDisplay} />
                )}
              </Col>
            </Row>
          </TabPanel>
        </Tabs>
      )}
    </Container>
  );
};

export default withSprintsCombined(Sprints);
