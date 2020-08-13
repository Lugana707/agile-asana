import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import axios from "axios";
import jsLogger from "js-logger";
import DataProvider from "./dataProvider";
import DataIntegrity from "./components/_dataIntegrity";
import Header from "./components/_header";
import Footer from "./components/_footer";
import Home from "./components/home";
import Backlog from "./components/backlog/index";
import BacklogForecastGrid from "./components/backlog/forecast/grid";
import BacklogForecastTable from "./components/backlog/forecast/table";
import Sprints from "./components/sprint/index";
import SprintShow from "./components/sprint/show";
import SprintTasks from "./components/sprint/tasks";
import Settings from "./components/settings/index";

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
      <DataProvider>
        <BrowserRouter>
          <DataIntegrity />
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/backlog" component={Backlog} />
            <Route
              exact
              path="/backlog/forecast/grid"
              component={BacklogForecastGrid}
            />
            <Route
              exact
              path="/backlog/forecast/table"
              component={BacklogForecastTable}
            />
            <Route exact path="/sprint" component={Sprints} />
            <Route exact path="/sprint/:projectGid" component={SprintShow} />
            <Route
              exact
              path="/sprint/:projectGid/task"
              component={SprintTasks}
            />
            <Route exact path="/settings" component={Settings} />
          </Switch>
          <Footer />
        </BrowserRouter>
      </DataProvider>
    </div>
  );
}

export default App;
