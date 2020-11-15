import React from "react";
import { Button } from "react-bootstrap";
import collect from "collect.js";
import { LinkContainer } from "react-router-bootstrap";
import Table from "../../library/table";

const Report = ({ loading, sprints, numberOfTags = 3 }) => {
  const popularTags = collect(sprints)
    .pluck("tasksCompleted")
    .flatten(1)
    .pluck("tags")
    .flatten(1)
    .countBy()
    .transform((item, key) => ({ name: key, count: item }))
    .reduce(
      (accumulator, currentValue) => accumulator.push(currentValue),
      collect([])
    )
    .sortByDesc("count")
    .take(numberOfTags)
    .pluck("name");

  const data = collect(sprints).map(sprint => {
    const {
      uuid,
      number,
      storyPoints,
      completedStoryPoints,
      tasksCompleted
    } = sprint;

    const percentageComplete =
      storyPoints === 0
        ? 100
        : Math.round((completedStoryPoints / parseFloat(storyPoints)) * 100);

    const tags = collect(tasksCompleted)
      .pluck("tags")
      .flatten(1)
      .countBy()
      .toJSON();

    return {
      uuid,
      number,
      percentageComplete,
      tags
    };
  });

  data.push({
    uuid: false,
    number: "",
    tags: popularTags
      .map(tag => ({
        name: tag,
        value: data
          .pluck("tags")
          .pluck(tag)
          .filter()
          .avg()
          .toFixed(2)
      }))
      .reduce(
        (accumulator, { name, value }) => ({ ...accumulator, [name]: value }),
        {}
      ),
    percentageComplete: data.avg("percentageComplete")
  });

  const TableRow = ({ data }) => {
    const { uuid, number, tags, percentageComplete } = data;

    return (
      <tr key={uuid}>
        <td className="text-left align-middle">
          <LinkContainer to={`/sprint/${uuid}`}>
            <Button variant="link">{number}</Button>
          </LinkContainer>
        </td>
        {popularTags.map(tag => (
          <td key={tag} className="text-center align-middle">
            {tags[tag]}
          </td>
        ))}
        <td className="text-center align-middle">
          <span>{percentageComplete}%</span>
        </td>
      </tr>
    );
  };

  return (
    <Table
      id="sprints"
      loading={loading}
      data={data.all()}
      row={TableRow}
      columns={["Sprint", ...popularTags.all(), "Commitments Met"]}
    />
  );
};

export default Report;
