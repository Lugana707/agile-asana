import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import axios from "axios";
import Logger from "js-logger";
import DataProvider from "./dataProvider";
import DataIntegrity from "./components/dataIntegrity";
import UpdateProjects from "./components/updateProjects";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./routes/home";
import BacklogDashboard from "./routes/backlog/dashboard";
import BacklogForecast from "./routes/backlog/forecast";
import Sprints from "./routes/sprint/index";
import SprintShow from "./routes/sprint/show";
import SprintTaskShow from "./routes/sprint/task/show";
import SprintReportShow from "./routes/sprint/report/show";
import Tasks from "./routes/task/index";
import TaskShow from "./routes/task/show";
import TaskForecastShow from "./routes/task/forecast/show";
import Settings from "./routes/settings";

axios.interceptors.response.use(null, error => {
  if (error.response && error.response.status === 401) {
    Logger.warn("Unauthorised!", { request: error.request });
  }
  Logger.error(error);
  return Promise.reject(error);
});

function App() {
  return (
    <div className="App">
      <DataProvider>
        <BrowserRouter>
          <DataIntegrity />
          <UpdateProjects seconds={60 * 3} />
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route
              exact
              path="/backlog/dashboard"
              component={BacklogDashboard}
            />
            <Route exact path="/backlog/forecast" component={BacklogForecast} />
            <Route exact path="/sprint" component={Sprints} />
            <Route exact path="/sprint/:uuid" component={SprintShow} />
            <Route exact path="/sprint/:uuid/task" component={SprintTaskShow} />
            <Route
              exact
              path="/sprint/:uuid/report"
              component={SprintReportShow}
            />
            <Route exact path="/task" component={Tasks} />
            <Route exact path="/task/:uuid" component={TaskShow} />
            <Route
              exact
              path="/task/:uuid/forecast"
              component={TaskForecastShow}
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
