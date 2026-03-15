import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// ✅ Setup theme safely AFTER imports
function applyInitialTheme() {
  const savedTheme = localStorage.getItem("themeMode");
  const rootElement = document.documentElement;
  const defaultTheme = savedTheme || "dark";
  rootElement.classList.add(defaultTheme);
}

applyInitialTheme(); // 🔥 Call it before React renders

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
