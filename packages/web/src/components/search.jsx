import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Autosuggest from "react-autosuggest";
import { Form, FormControl, Button, InputGroup } from "react-bootstrap";
import withTasks from "./task/withTasks";

const Search = ({ tasks, ...props }) => {
  const [value, setValue] = useState("");

  const suggestions = useMemo(
    () =>
      tasks
        .filter(({ name }) => name.toLowerCase().includes(value))
        .dump()
        .take(10)
        .toArray(),
    [value, tasks]
  );

  if (false) {
    return (
      <Form {...props}>
        <InputGroup>
          <FormControl type="text" placeholder="Search" />
          <InputGroup.Append>
            <Button>
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Form>
    );
  }

  const inputProps = {
    placeholder: "Search for a task...",
    value,
    onChange: (event, { newValue }) => setValue(newValue.toLowerCase())
  };

  return (
    <Form {...props}>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={() =>
          console.debug("Hello onSuggestionsFetchRequested!")
        }
        onSuggestionsClearRequested={() =>
          console.debug("Hello onSuggestionsClearRequested!")
        }
        getSuggestionValue={suggestion => suggestion && suggestion.name}
        renderSuggestion={({ name }) => <div>{name}</div>}
        inputProps={inputProps}
      />
    </Form>
  );
};

export default withTasks(Search);
