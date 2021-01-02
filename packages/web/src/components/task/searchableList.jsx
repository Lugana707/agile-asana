import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  InputGroup,
  Button
} from "react-bootstrap";
import collect from "collect.js";
import TagsFilter, { withTagsFilterFromURL } from "../library/tags/filter";
import SprintCardAndTable from "../sprint/task/sprintCardAndTable";

const SearchableList = ({ sprint, tagsFilter }) => {
  const [search, setSearch] = useState("");

  const searchedTasks = useMemo(() => {
    const regex = new RegExp(`${search}`, "mui");
    return collect(sprint.tasks).when(!!search, collection =>
      collection.filter(({ name, description, tags, assignee }) =>
        regex.test(
          name + description + tags.join("") + (assignee || { name: "" }).name
        )
      )
    );
  }, [sprint.tasks, search]);

  if (!sprint) {
    return <div />;
  }

  return (
    <>
      <Container className="pb-4">
        <Row className="pb-2">
          <Col xs={12}>
            <TagsFilter />
          </Col>
        </Row>
        <Form as={Row} inline>
          <InputGroup as={Col}>
            <FormControl
              type="text"
              placeholder="Search task by name, description, tags, or assignee..."
              value={search}
              onChange={({ target }) => setSearch(target.value)}
            />
            <InputGroup.Append>
              <Button>
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      </Container>
      <Container fluid>
        <Row>
          <Col xs={12}>
            <SprintCardAndTable
              sprint={{ ...sprint, tasks: searchedTasks.toArray() }}
              tags={tagsFilter}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withTagsFilterFromURL(SearchableList);
