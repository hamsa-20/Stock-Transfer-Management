import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// @ts-ignore: Allow CSS side-effect import without type declarations
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
