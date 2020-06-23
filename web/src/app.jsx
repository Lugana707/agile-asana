import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import axios from "axios";
import jsLogger from "js-logger";
import configureStore from "./scripts/redux/configureStore";
import { ASANA_API_TOKEN } from "./scripts/api";
import Home from "./components/home";
import Projects from "./components/project/index";
import ProjectShow from "./components/project/show";
import ProjectTasks from "./components/project/tasks";

const { store, persistor } = configureStore();

axios.interceptors.request.use(
  ({ headers, ...config }) => {
    return {
      headers: {
        Authorization: `Bearer ${ASANA_API_TOKEN}`,
        ...headers
      },
      ...config
    };
  },
  error => {
    jsLogger.error(error);
    return Promise.reject(error);
  }
);
axios.interceptors.response.use(null, error => {
  if (error.response && error.response.status === 401) {
    jsLogger.warn("Unauthorised!", { request: error.request });
  }
  jsLogger.error(error);
  return Promise.reject(error);
});

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/project" component={Projects} />
              <Route
                exact
                path="/project/:projectGid"
                component={ProjectShow}
              />
              <Route
                exact
                path="/project/:projectGid/task"
                component={ProjectTasks}
              />
            </Switch>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
