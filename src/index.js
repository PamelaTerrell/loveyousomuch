import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App";
import Admin from "./Admin";
import PrivateLoveNote from "./PrivateLoveNote";
import Support from "./Support";
import Privacy from "./Privacy";

import reportWebVitals from "./reportWebVitals";

function RootApp() {
  const pathname =
    window.location.pathname;

  if (pathname === "/admin") {
    return <Admin />;
  }

  if (pathname === "/support") {
    return <Support />;
  }

  if (pathname === "/privacy") {
    return <Privacy />;
  }

  if (
    pathname === "/private" ||
    pathname.startsWith("/love/")
  ) {
    return <PrivateLoveNote />;
  }

  return <App />;
}

const root =
  ReactDOM.createRoot(
    document.getElementById("root")
  );

root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

reportWebVitals();