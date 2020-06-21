import React, { StrictMode } from "react";
import { render } from "react-dom";
import "./styles/index.scss";
import App from "./app";

const renderApp = rootElement => {
  render(
    <StrictMode>
      <App />
    </StrictMode>,
    document.getElementById(rootElement)
  );
};

export default renderApp;
