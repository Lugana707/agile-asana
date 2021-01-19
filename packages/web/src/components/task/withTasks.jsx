import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import collect from "collect.js";
import moment from "moment";
import { MATCH_PROJECT_KANBAN } from "../../scripts/redux/actions/asanaActions";

export default WrappedComponent => props => {
  const { data: tasks } = useSelector(state => state.asanaTasks);
  const { data: users } = useSelector(state => state.users);
  const { data: asanaProjects } = useSelector(state => state.asanaProjects);

  const usersCollection = useMemo(() => collect(users), [users]);

  const asanaProjectsCollection = useMemo(() => collect(asanaProjects), [
    asanaProjects
  ]);

  const parseTask = useCallback(
    task => {
      const {
        gid,
        name,
        due_on,
        created_at,
        completed_at,
        storyPoints,
        tags,
        memberships,
        notes,
        html_notes,
        assignee,
        created_by,
        permalink_url,
        parent,
        subtasks,
        custom_fields
      } = task;

      const completedAt = completed_at ? moment(completed_at) : false;

      const mostRecentSprint = collect(task.sprints)
        .map(uuid => asanaProjectsCollection.firstWhere("gid", uuid))
        .filter()
        .filter(({ name }) => MATCH_PROJECT_KANBAN.test(name))
        .sortBy(({ created_at }) => moment(created_at).unix())
        .pluck("gid")
        .last();

      const getCompletedDayOfSprint = () => {
        if (completedAt && mostRecentSprint) {
          const asanaProject = asanaProjectsCollection.firstWhere(
            "gid",
            mostRecentSprint
          );

          return (
            moment(asanaProject.created_at).weekday() +
            completedAt.diff(asanaProject.created_at, "days")
          );
        }

        return false;
      };

      return {
        uuid: gid,
        name,
        dueOn: due_on ? moment(due_on) : false,
        createdAt: created_at ? moment(created_at) : false,
        completedAt,
        storyPoints,
        tags: collect(tags || [])
          .pluck("name")
          .toArray(),
        sections: collect(memberships || [])
          .pluck("section.name")
          .toArray(),
        sprints: collect(memberships || [])
          .pluck("project.gid")
          .toArray(),
        description: html_notes || notes,
        assignee,
        createdBy: created_by,
        externalLink: permalink_url,
        parent: parent && parent.gid,
        subtasks: collect(subtasks || [])
          .pluck("gid")
          .toArray(),
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
        completedAtDayOfSprint: getCompletedDayOfSprint()
      };
    },
    [asanaProjectsCollection]
  );

  const tasksCollectionWithInlineTasks = useMemo(
    () =>
      collect(tasks)
        .map(task => parseTask(task))
        .map(({ assignee, ...task }) => ({
          assignee: assignee && usersCollection.firstWhere("uuid", assignee),
          ...task
        })),
    [tasks, parseTask, usersCollection]
  );

  return <WrappedComponent {...props} tasks={tasksCollectionWithInlineTasks} />;
};
