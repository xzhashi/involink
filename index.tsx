import React from "react";
import ReactDOM from "react-dom/client"; // The trailing slash is important here
import { BrowserRouter } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);