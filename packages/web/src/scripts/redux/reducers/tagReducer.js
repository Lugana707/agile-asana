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
    const tagsCollection = collect(tasks)
      .pluck("tags")
      .flatten(1)
      .where("name")
      .unique("name")
      .map(({ gid, color, ...tag }) => ({
        ...tag,
        [uuidKey]: gid,
        color: getColourFromTag({ color })
      }));

    const ids = tagsCollection
      .pluck(uuidKey)
      .unique()
      .sort()
      .toArray();

    const data = tagsCollection.sortBy("name").toArray();

    return {
      ...state,
      loading: false,
      ids,
      data,
      timestamp: new Date()
    };
  };

  return (state = initialState, { type, loading, data, payload } = {}) => {
    switch (type) {
      case REHYDRATE:
        if (!payload || !payload.asanaTasks) {
          return state;
        }

        const { asanaTasks } = payload;

        return onTasksSetHandler({
          state,
          loading: false,
          tasks: asanaTasks.data || asanaTasks.asanaTasks
        });
      case "SUCCESS_LOADING_ASANATASKS":
        return onTasksSetHandler({ state, tasks: data });
      case "LOGOUT":
        return initialState;
      default:
        return state;
    }
  };
};
