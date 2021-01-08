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
import Table from "../library/table";
import TagsFilter, { withTagsFilterFromURL } from "../library/tags/filter";
import TaskTableRow from "./tableRow";

const SearchableList = ({ tasks, tagsFilter }) => {
  const [search, setSearch] = useState("");

  const searchedTasks = useMemo(() => {
    const regex = new RegExp(`${search}`, "mui");
    return collect(tasks).when(!!search, collection =>
      collection.filter(({ name, description, tags, assignee }) =>
        regex.test(
          name + description + tags.join("") + (assignee || { name: "" }).name
        )
      )
    );
  }, [tasks, search]);

  const filteredTasks = useMemo(
    () =>
      tagsFilter
        ? searchedTasks.when(tagsFilter.isNotEmpty(), collection =>
            collection.filter(task =>
              tagsFilter.whereIn(true, task.tags).isNotEmpty()
            )
          )
        : searchedTasks,
    [searchedTasks, tagsFilter]
  );

  if (!tasks) {
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
          <Col xs={12} className="pl-1">
            <Table
              className="mb-0"
              data={filteredTasks.toArray()}
              row={TaskTableRow}
              variant={"dark"}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default withTagsFilterFromURL(SearchableList);
