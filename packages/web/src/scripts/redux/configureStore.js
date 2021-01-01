/* jshint -W014 */

import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
//import monitorReducersEnhancer from "./enhancers/monitorReducers";
import loggerMiddleware from "./middleware/logger";
import globalReducer from "./reducers/globalReducer";
import crudReducer from "./reducers/crudReducer";
import objectReducer from "./reducers/objectReducer";
import TaskReducer from "./reducers/taskReducer";
import SprintReducer from "./reducers/sprintReducer";
import BacklogReducer from "./reducers/backlogReducer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["asanaProjects", "asanaTasks", "settings"],
  transforms: [
    createTransform(
      ({ loading, ...inboundState }) => inboundState,
      ({ loading, ...outboundState }) => outboundState
    )
  ]
};

const initialiseReduxStore = preloadedState => {
  const { NODE_ENV } = process.env;

  const middlewares = [loggerMiddleware, thunkMiddleware];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = (NODE_ENV !== "production"
    ? composeWithDevTools
    : compose)(...enhancers);

  const rootReducer = combineReducers({
    globalReducer,
    asanaProjects: crudReducer("asanaProjects", "gid"),
    asanaTasks: crudReducer("asanaTasks", "gid"),
    backlogTasks: crudReducer("backlogTasks", "uuid"),
    refinedBacklogTasks: crudReducer("refinedBacklogTasks", "uuid"),
    unrefinedBacklogTasks: crudReducer("unrefinedBacklogTasks", "uuid"),
    tags: crudReducer("tags", "uuid"),
    tasks: TaskReducer(),
    sprints: SprintReducer(),
    backlogs: BacklogReducer(),
    settings: objectReducer("settings")
  });

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store = createStore(
    persistedReducer,
    preloadedState,
    composedEnhancers
  );
  const persistor = persistStore(store);

  return { store, persistor };
};

export default initialiseReduxStore;
