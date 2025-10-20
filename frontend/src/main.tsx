import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

// ✅ Always default to dark mode if there's no saved preference
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  // Default is dark
  document.documentElement.classList.add("dark");
  localStorage.setItem("theme", "dark");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
