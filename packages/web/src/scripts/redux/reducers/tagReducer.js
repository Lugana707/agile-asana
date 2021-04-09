/* jshint maxcomplexity:8 */

import { REHYDRATE } from "redux-persist";
import collect from "collect.js";
import { getColourFromTag } from "../../helpers/asanaColours";

export default () => {
  const initialState = {
    loading: false,
    ids: [],
    data: [],
    timestamp: false
  };

  const uuidKey = "uuid";

  const onTasksSetHandler = ({ state, tasks }) => {
    const tagsCollection = tasks
      .pluck("tags")
      .flatten(1)
      .where("name")
      .unique("name")
      .map(({ gid, color, ...tag }) => ({
        ...tag,
        [uuidKey]: gid,
        color: getColourFromTag({ color })
      }));

    const data = collect(state.data)
      .whereNotIn(uuidKey, tagsCollection.pluck(uuidKey).toArray())
      .merge(tagsCollection.toArray())
      .unique("name")
      .sortBy(uuidKey);

    return {
      ...state,
      ids: data.pluck(uuidKey).toArray(),
      data: data.toArray(),
      timestamp: new Date()
    };
  };

  return (state = initialState, { type, loading, tasks, payload } = {}) => {
    switch (type) {
      case REHYDRATE:
        if (!payload || !payload.asanaTasks) {
          return state;
        }

        const { asanaTasks } = payload;

        return onTasksSetHandler({
          state,
          tasks: collect(asanaTasks.data || asanaTasks.asanaTasks || [])
        });
      case "ASANA_PROJECT_ADDED":
        return onTasksSetHandler({ state, tasks });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
