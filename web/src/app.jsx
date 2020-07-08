import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import axios from "axios";
import jsLogger from "js-logger";
import DataProvider from "./dataProvider";
import Header from "./components/_header";
import Footer from "./components/_footer";
import Home from "./components/home";
import Backlog from "./components/backlog/index";
import Projects from "./components/project/index";
import ProjectShow from "./components/project/show";
import ProjectTasks from "./components/project/tasks";
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
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/backlog" component={Backlog} />
            <Route exact path="/project" component={Projects} />
            <Route exact path="/project/:projectGid" component={ProjectShow} />
            <Route
              exact
              path="/project/:projectGid/task"
              component={ProjectTasks}
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
