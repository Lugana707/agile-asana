import React from "react";
import { render } from "react-dom";
import "./styles/index.scss";
import App from "./app";

const renderApp = rootElement => {
  render(<App />, document.getElementById(rootElement));
};

export default renderApp;
