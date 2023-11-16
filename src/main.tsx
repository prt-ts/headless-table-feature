import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App.tsx";
import "./index.css";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
 
ReactDOM.render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <App />
    </FluentProvider>
  </React.StrictMode>,
  document.getElementById("root")
);