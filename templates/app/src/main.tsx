import React from "react";
import ReactDOM from "react-dom/client";
import { createApp } from "@noopejs/react-gen/App";
import RootModule from "./root/root.module";
import { sparkApp } from "@noopejs/react-gen";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

sparkApp(RootModule);
const App = createApp("Main");

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
