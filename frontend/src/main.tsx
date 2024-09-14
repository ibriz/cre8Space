import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { EnokiFlowProvider } from "@mysten/enoki/react";
import { UserProvider } from "./context/UserContext.tsx";

const ENOKI_API_KEY = import.meta.env.VITE_APP_ENOKI_API_KEY;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EnokiFlowProvider apiKey={ENOKI_API_KEY}>
      <UserProvider>
        <App />
      </UserProvider>
    </EnokiFlowProvider>
  </React.StrictMode>,
);
