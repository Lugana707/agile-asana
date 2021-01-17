import React, { useMemo, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  InputGroup,
  ButtonGroup,
  Button
} from "react-bootstrap";
import collect from "collect.js";
import Table from "../library/table";
import TagsFilter, { withTagsFilterFromURL } from "../library/tags/filter";
import TaskTableRow from "./tableRow";

const MAX_TASKS_PER_PAGE = 100;

const SearchableList = ({ tasks, tagsFilter }) => {
  const [page, setPage] = useState(0);

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

  const filteredTasksChunks = useMemo(
    () =>
      (tagsFilter
        ? searchedTasks.when(tagsFilter.isNotEmpty(), collection =>
            collection.filter(task =>
              tagsFilter.whereIn(true, task.tags).isNotEmpty()
            )
          )
        : searchedTasks
      ).chunk(MAX_TASKS_PER_PAGE),
    [searchedTasks, tagsFilter]
  );

  const currentPageNumber = useMemo(
    () => Math.min(page, filteredTasksChunks.count() - 1),
    [page, filteredTasksChunks]
  );

  useEffect(() => {
    if (page > filteredTasksChunks.count() - 1) {
      setPage(filteredTasksChunks.count() - 1);
    }
  }, [page, filteredTasksChunks]);

  if (!tasks) {
    return <div />;
  }

  return (
    <>
      <Container fluid className="pb-2 sticky-top">
        <Container>
          <Row className="pb-2">
            <Col xs={12}>
              <TagsFilter />
            </Col>
          </Row>
          <Form as={Row} xs={12} inline>
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
          {filteredTasksChunks.count() > 1 && (
            <Col xs={12} className="pt-2">
              <ButtonGroup>
                {filteredTasksChunks.map((chunk, index) => (
                  <Button
                    key={index}
                    variant="primary"
                    onClick={() => setPage(index)}
                    disabled={index === currentPageNumber}
                  >
                    {index + 1}
                  </Button>
                ))}
              </ButtonGroup>
            </Col>
          )}
          <div className="clearfix clear-fix" />
        </Container>
      </Container>
      <Container fluid>
        <Row>
          <Col xs={12}>
            <Table
              className="mb-0"
              data={filteredTasksChunks.get(currentPageNumber).toArray()}
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
