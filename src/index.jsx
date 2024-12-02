import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import './styles/tailwind.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App /> {/* App now includes all routes and Header */}
      </BrowserRouter>
    </React.StrictMode>
  );
  