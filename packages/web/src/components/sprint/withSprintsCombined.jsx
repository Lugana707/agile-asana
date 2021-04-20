import React, { useMemo } from "react";
import collect from "collect.js";
import moment from "moment";
import withSprints from "./withSprints";
import { RUNNING_AVERAGE_WEEK_COUNT } from "../../scripts/redux/selectors/sprints";

export default WrappedComponent =>
  withSprints(({ sprints, ...props }) => {
    const sprintsCombined = useMemo(
      () =>
        sprints
          .groupBy("number")
          .map((value, key) => ({
            ...value.first(),
            averageCompletedStoryPoints: value.sum(
              "averageCompletedStoryPoints"
            ),
            completedStoryPoints: value.sum("completedStoryPoints"),
            customFieldNames: collect([]),
            externalLink: "https://app.asana.com/",
            finishedOn: false,
            isCompletedSprint: !!value.firstWhere("isCompletedSprint", true),
            isCurrentSprint: !!value.firstWhere("isCurrentSprint", true),
            name: `Sprint ${key} (Combined)`,
            number: parseInt(key, 10),
            releases: value
              .pluck("releases")
              .flatten(1)
              .unique("uuid"),
            sections: value
              .pluck("sections")
              .flatten(1)
              .unique("uuid"),
            sprintLength: value.max("sprintLength"),
            startOn: moment(value.map(({ startOn }) => startOn.unix()).min()),
            storyPoints: value.sum("storyPoints"),
            tasks: value.pluck("tasks").flatten(1),
            tasksCompleted: value.pluck("tasksCompleted").flatten(1),
            uuid: value.pluck("uuid").join(",")
          }))
          .pipe(collection => collect(collection.toArray()))
          .sortByDesc("number")
          .map(({ averageCompletedStoryPoints, ...sprint }, index, array) => ({
            averageCompletedStoryPoints: Math.round(
              collect(array)
                .where("number", "<=", sprint.number)
                .take(RUNNING_AVERAGE_WEEK_COUNT)
                .map(
                  ({ isCompletedSprint, completedStoryPoints, storyPoints }) =>
                    isCompletedSprint ? completedStoryPoints : storyPoints
                )
                .average()
            ),
            ...sprint
          })),
      [sprints]
    );

    return (
      <WrappedComponent
        {...props}
        sprints={sprints}
        sprintsCombined={sprintsCombined}
      />
    );
  });
