import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Bar } from "react-chartjs-2";
import collect from "collect.js";
import Color from "color";
import withBacklogTasks from "../withBacklogTasks";

const BacklogProgressPerSprint = ({ sprint, backlogTasks }) => {
  const { tags: fullListOfTags } = useSelector(state => state.tags);

  const getAsanaTag = useCallback(
    tag => collect(fullListOfTags).firstWhere("name", tag),
    [fullListOfTags]
  );

  backlogTasks.macro("groupByTagAndCount", function() {
    return this.map(({ tags, storyPoints = 0 }) =>
      tags.map(tag => ({ tag, storyPoints }))
    )
      .flatten(1)
      .groupBy("tag")
      .map((value, key) => ({
        tag: key,
        storyPoints: value.sum("storyPoints"),
        count: value.count()
      }))
      .pipe(collection => collect(collection.toArray()));
  });

  const backlogTasksCreatedDuringSprint = useMemo(
    () =>
      collect(backlogTasks).filter(({ createdAt }) =>
        createdAt.isBetween(sprint.startOn, sprint.finishedOn)
      ),
    [sprint.startOn, sprint.finishedOn, backlogTasks]
  );

  const backlogTasksCompletedDurnigSprint = useMemo(
    () =>
      collect(backlogTasks)
        .where("completedAt")
        .filter(({ completedAt }) =>
          completedAt.isBetween(sprint.startOn, sprint.finishedOn)
        ),
    [sprint.startOn, sprint.finishedOn, backlogTasks]
  );

  const sprintTasksCreatedDuringSprint = useMemo(
    () =>
      collect(sprint.tasks).filter(({ createdAt }) =>
        createdAt.isBetween(sprint.startOn, sprint.finishedOn)
      ),
    [sprint.tasks, sprint.startOn, sprint.finishedOn]
  );

  const tasksCompletedByTags = useMemo(
    () =>
      collect(sprint.tasksCompleted)
        .merge(backlogTasksCompletedDurnigSprint.toArray())
        .unique("uuid")
        .groupByTagAndCount(),
    [sprint.tasksCompleted, backlogTasksCompletedDurnigSprint]
  );

  const tasksCreatedByTag = useMemo(
    () =>
      backlogTasksCreatedDuringSprint
        .merge(sprintTasksCreatedDuringSprint.toArray())
        .unique("uuid")
        .groupByTagAndCount(),
    [backlogTasksCreatedDuringSprint, sprintTasksCreatedDuringSprint]
  );

  const tags = useMemo(
    () =>
      tasksCompletedByTags
        .merge(tasksCreatedByTag.toArray())
        .pluck("tag")
        .unique()
        .sort()
        .map(tag => ({
          tag,
          colour: Color(getAsanaTag(tag).color)
        })),
    [tasksCompletedByTags, tasksCreatedByTag, getAsanaTag]
  );

  const getTaskCountBytag = useCallback(
    tasks =>
      tags.map(
        ({ tag }) =>
          (
            tasks.firstWhere("tag", tag) || {
              count: 0
            }
          ).count
      ),
    [tags]
  );

  const data = useMemo(
    () => ({
      labels: tags.pluck("tag").toArray(),
      datasets: [
        {
          label: "Tasks Completed",
          backgroundColor: tags
            .map(({ colour }) => colour.saturate(0.3).hex())
            .toArray(),
          borderWidth: 1,
          data: getTaskCountBytag(tasksCompletedByTags).toArray()
        },
        {
          label: "Tasks Created",
          backgroundColor: tags
            .map(({ colour }) => colour.desaturate(0.3).hex())
            .toArray(),
          borderWidth: 1,
          data: getTaskCountBytag(tasksCreatedByTag)
            .map(obj => -obj)
            .toArray()
        }
      ]
    }),
    [tags, getTaskCountBytag, tasksCompletedByTags, tasksCreatedByTag]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) =>
            `${data.datasets[tooltipItem.datasetIndex].label}: ${Math.abs(
              tooltipItem.yLabel
            )}`
        }
      },
      scales: {
        xAxes: [
          {
            stacked: true
          }
        ],
        yAxes: [
          {
            stacked: true,
            ticks: { beginAtZero: true, precision: 0 }
          }
        ]
      }
    }),
    []
  );

  return (
    <div className="chartjs-min-height">
      <Bar data={data} options={options} legend={{ display: false }} />
    </div>
  );
};

export default withBacklogTasks(BacklogProgressPerSprint);
