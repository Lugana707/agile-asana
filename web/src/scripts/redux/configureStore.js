/* jshint -W014 */

import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
//import monitorReducersEnhancer from "./enhancers/monitorReducers";
import loggerMiddleware from "./middleware/logger";
import globalReducer from "./reducers/globalReducer";
import crudReducer from "./reducers/crudReducer";
import objectReducer from "./reducers/objectReducer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["rawBacklogTasks", "rawProjects", "rawProjectTasks", "settings"]
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
    rawBacklogTasks: objectReducer("rawBacklogTasks"),
    backlogTasks: objectReducer("backlogTasks"),
    rawProjects: crudReducer("rawProjects"),
    asanaProjects: crudReducer("asanaProjects"),
    rawProjectTasks: crudReducer("rawProjectTasks"),
    asanaProjectTasks: crudReducer("asanaProjectTasks"),
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
