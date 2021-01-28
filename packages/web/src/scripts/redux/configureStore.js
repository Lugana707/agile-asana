/* jshint -W014 */

import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
//import monitorReducersEnhancer from "./enhancers/monitorReducers";
import loggerMiddleware from "./middleware/logger";
import globalReducer from "./reducers/globalReducer";
import objectReducer from "./reducers/objectReducer";
import AsanaProjectReducer from "./reducers/asana/projectReducer";
import AsanaTaskReducer from "./reducers/asana/taskReducer";
import SprintReducer from "./reducers/sprintReducer";
import BacklogReducer from "./reducers/backlogReducer";
import UserReducer from "./reducers/userReducer";
import TagReducer from "./reducers/tagReducer";
import GithubOrganisationsReducer from "./reducers/github/organisations";
import GithubRepositories from "./reducers/github/repositories";
import GithubPullRequestsReducer from "./reducers/github/pullRequests";
import GithubReleases from "./reducers/github/releases";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["asanaProjects", "asanaTasks", "users", "settings"],
  transforms: [
    createTransform(
      ({ loading, ...inboundState }) => inboundState,
      ({ loading, ids, ...outboundState }) => outboundState
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
    asanaProjects: AsanaProjectReducer(),
    asanaTasks: AsanaTaskReducer(),
    tags: TagReducer(),
    sprints: SprintReducer(),
    backlogs: BacklogReducer(),
    users: UserReducer(),
    settings: objectReducer("settings"),
    githubOrganisations: GithubOrganisationsReducer(),
    githubRepositories: GithubRepositories(),
    githubPullRequests: GithubPullRequestsReducer(),
    githubReleases: GithubReleases()
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
