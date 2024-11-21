import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import OrderAndPaper from "./components/Section1"
import FSSection from "./components/Section2FS";

const root = ReactDOM.createRoot(
    document.getElementById("root")
  );
  root.render(
      <App>
        <OrderAndPaper/>
        <FSSection/>
      </App>
  );
  