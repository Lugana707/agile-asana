import { createSelector } from "reselect";
import collect from "collect.js";
import moment from "moment";
import { selectSprints } from "./sprints";
import { pullRequests, releases } from "./code";

/* jshint maxcomplexity:14 */
const parseTask = (asanaTask, asanaTasks, allSprints, users) => {
  const usersCollection = collect(users);

  const {
    gid,
    name,
    due_on,
    created_at,
    completed_at,
    storyPoints,
    notes,
    html_notes,
    assignee,
    created_by,
    permalink_url,
    parent,
    custom_fields,
    tags = [],
    memberships = [],
    subtasks = [],
    dependencies = [],
    dependents = []
  } = asanaTask;

  const completedAt = completed_at ? moment(completed_at) : false;

  const sprints = collect(memberships).pluck("project.gid");

  const mostRecentSprint = sprints
    .map(uuid => allSprints.firstWhere("uuid", uuid))
    .filter()
    .sortBy(({ startOn }) => startOn.unix())
    .pluck("uuid")
    .last();

  const getCompletedDayOfSprint = () => {
    if (completedAt && mostRecentSprint) {
      const sprint = allSprints.firstWhere("uuid", mostRecentSprint);

      return (
        moment(sprint.startOn).weekday() +
        completedAt.diff(sprint.startOn, "days")
      );
    }

    return false;
  };

  const subtaskCollection = collect(subtasks)
    .map(subtask => collect(asanaTasks).firstWhere("gid", subtask))
    .where();
  const percentComplete =
    subtaskCollection.isNotEmpty() &&
    Math.round(
      (subtaskCollection.where("completed_at").count() /
        subtaskCollection.count()) *
        100
    );

  const createdAt = created_at ? moment(created_at) : moment();

  const tagNameCollection = collect(tags).pluck("name");

  const commitment =
    tagNameCollection.isNotEmpty() && !tagNameCollection.some("Unplanned");
  const unplanned = !commitment && tagNameCollection.isNotEmpty();

  return {
    uuid: gid,
    name,
    dueOn: due_on ? moment(due_on) : false,
    createdAt,
    completedAt,
    weight: storyPoints,
    storyPoints,
    tags: tagNameCollection.toArray(),
    sections: collect(memberships || [])
      .pluck("section")
      .map(section => ({ uuid: section.gid, name: section.name }))
      .toArray(),
    sprints: sprints.toArray(),
    description: html_notes || notes,
    assignee: assignee && usersCollection.firstWhere("uuid", assignee),
    createdBy: created_by,
    commitment,
    unplanned,
    externalLink: permalink_url,
    parent: parent && parent.gid,
    subtasks,
    customFields: collect(custom_fields || [])
      .where("enum_value")
      .map(({ name: customFieldName, enum_value }) => ({
        name: customFieldName,
        value: {
          color: enum_value.color,
          name: enum_value.name
        }
      }))
      .toArray(),
    mostRecentSprint,
    completedAtDayOfSprint: getCompletedDayOfSprint(),
    percentComplete,
    dependencies: collect(dependencies || []).pluck("gid"),
    dependents: collect(dependents || []).pluck("gid"),
    "@asana": asanaTask
  };
};

export const selectTasks = createSelector(
  state => state.asanaTasks.data,
  selectSprints,
  state => state.users.data,
  pullRequests,
  releases,
  /* jshint maxparams:5 */
  (asanaTasks, allSprints, users, pullRequests, releases) =>
    collect(asanaTasks)
      .map(asanaTask => parseTask(asanaTask, asanaTasks, allSprints, users))
      .map(task => {
        const taskPullRequests = pullRequests
          .where("body")
          .filter(({ body }) => body.includes(task.uuid));

        return {
          ...task,
          pullRequests: taskPullRequests,
          releases: taskPullRequests
            .pluck("number")
            .map(number =>
              releases
                .where("body")
                .filter(({ body }) => body.includes(`#${number}`))
                .toArray()
            )
            .flatten(1)
            .unique("uuid")
        };
      })
);
