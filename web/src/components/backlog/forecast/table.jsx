import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import Table from "../../_library/_table";
import BacklogTableRow from "../_backlogTableRow";

const BacklogForecastTable = () => {
  const { loading, refined } = useSelector(state => state.backlogTasks);
  const { asanaProjectTasks } = useSelector(state => state.asanaProjectTasks);

  const sprints = useMemo(() => asanaProjectTasks || [], [asanaProjectTasks]);
  const currentSprint = useMemo(() => sprints[0], [sprints]);
  const forecastStoryPoints = useMemo(
    () => (currentSprint || {}).runningAverageCompletedStoryPoints,
    [currentSprint]
  );

  const forecast = useMemo(() => {
    let index = 0;
    let totalStoryPoints = 0;
    return (refined || [])
      .filter(
        ({ projects }) =>
          !projects.map(({ gid }) => gid).includes(currentSprint.gid)
      )
      .reduce((accumulator, currentValue) => {
        const { storyPoints = 0 } = currentValue;
        totalStoryPoints = totalStoryPoints + storyPoints;

        if (totalStoryPoints >= forecastStoryPoints) {
          index = index + 1;
          totalStoryPoints = storyPoints;
        }

        let tasks = [...accumulator];
        tasks[index] = (accumulator[index] || []).concat([currentValue]);

        return tasks;
      }, [])
      .map((tasks, index) => [
        {
          className: "bg-info",
          sprintNumber: index + 1 + currentSprint.week,
          storyPoints: tasks.reduce(
            (accumulator, { storyPoints = 0 }) => accumulator + storyPoints,
            0
          )
        },
        ...tasks
      ])
      .flat();
  }, [refined, forecastStoryPoints, currentSprint]);

  if (!asanaProjectTasks) {
    return <div />;
  }

  const ForecastTableRow = parameters => {
    const { data, index } = parameters;

    if (data.sprintNumber) {
      const { sprintNumber, storyPoints } = data;
      return (
        <>
          <td className="align-middle text-left" colspan="3">
            <h4 className="d-inline">Sprint {sprintNumber}</h4>
            <span className="pl-3">
              {moment(currentSprint.dueOn)
                .add(index + 1, "weeks")
                .format("YYYY-MM-DD")}
            </span>
          </td>
          <td className="align-middle text-right">
            <h4>{storyPoints}</h4>
          </td>
        </>
      );
    }

    return BacklogTableRow(parameters);
  };

  return (
    <Table
      id="backlog__forecast"
      loading={loading}
      data={forecast}
      row={ForecastTableRow}
    />
  );
};

export default BacklogForecastTable;
