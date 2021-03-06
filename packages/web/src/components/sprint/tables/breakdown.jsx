import React, { useMemo } from "react";
import { Button } from "react-bootstrap";
import collect from "collect.js";
import { LinkContainer } from "react-router-bootstrap";
import Table from "../../library/table";

const Report = ({ loading, sprints, numberOfTags = 3 }) => {
  const popularTags = useMemo(
    () =>
      collect(sprints)
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
        .pluck("name"),
    [sprints, numberOfTags]
  );

  const data = useMemo(
    () =>
      collect(sprints)
        .map(sprint => {
          const {
            uuid,
            name,
            storyPoints,
            completedStoryPoints,
            tasksCompleted
          } = sprint;

          const percentageComplete =
            storyPoints === 0
              ? 100
              : Math.round(
                  (completedStoryPoints / parseFloat(storyPoints)) * 100
                );

          const tags = collect(tasksCompleted)
            .pluck("tags")
            .flatten(1)
            .countBy()
            .toJSON();

          return {
            uuid,
            name,
            percentageComplete,
            tags
          };
        })
        .pipe(collection =>
          collection.push({
            uuid: false,
            name: "",
            tags: popularTags
              .map(tag => ({
                name: tag,
                value: collection
                  .pluck("tags")
                  .pluck(tag)
                  .filter()
                  .avg()
                  .toFixed(2)
              }))
              .reduce(
                (accumulator, { name, value }) => ({
                  ...accumulator,
                  [name]: value
                }),
                {}
              ),
            percentageComplete: collection.avg("percentageComplete")
          })
        ),
    [sprints, popularTags]
  );

  const TableRow = ({ data }) => {
    const { uuid, name, tags, percentageComplete } = data;

    return (
      <tr key={uuid}>
        <td className="text-left align-middle">
          <LinkContainer to={`/sprint/${uuid}`}>
            <Button variant="link" className="pl-0">
              {name}
            </Button>
          </LinkContainer>
        </td>
        {popularTags.map(tag => (
          <td key={tag} className="text-right align-middle">
            {tags[tag]}
          </td>
        ))}
        <td className="text-right align-middle">
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
      className="text-right"
      columns={[
        <div className="text-left">Sprint</div>,
        ...popularTags.all(),
        "Commitments Met"
      ]}
    />
  );
};

export default Report;
