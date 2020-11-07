import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import axios from "axios";
import jsLogger from "js-logger";
import DataProvider from "./dataProvider";
import DataIntegrity from "./components/dataIntegrity";
import UpdateSprints from "./components/sprint/updateSprints";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./routes/home";
import BacklogForecastDashboard from "./routes/backlog/forecast/dashboard";
import BacklogForecastGrid from "./routes/backlog/forecast/grid";
import Sprints from "./routes/sprint/index";
import SprintShow from "./routes/sprint/show";
import SprintTasks from "./routes/sprint/tasks";
import SprintReport from "./routes/sprint/report";
import Settings from "./routes/settings";

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
          <UpdateSprints seconds={60 * 5} />
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route
              exact
              path="/backlog/forecast/dashboard"
              component={BacklogForecastDashboard}
            />
            <Route
              exact
              path="/backlog/forecast/grid"
              component={BacklogForecastGrid}
            />
            <Route exact path="/sprint" component={Sprints} />
            <Route exact path="/sprint/:uuid" component={SprintShow} />
            <Route exact path="/sprint/:uuid/task" component={SprintTasks} />
            <Route exact path="/sprint/:uuid/report" component={SprintReport} />
            <Route exact path="/settings" component={Settings} />
          </Switch>
          <Footer />
        </BrowserRouter>
      </DataProvider>
    </div>
  );
}

export default App;
