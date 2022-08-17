import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { initAnalytics } from "./shared/utils/analyticsUtils";
import { theme } from "./shared/theme";
import { ErrorBoundary } from "react-error-boundary";

(async () => {
  const isDev = await window.electron.isDev();
  console.log(`isDev: ${isDev}`);
  initAnalytics(isDev);

  runApp();
})();

function runApp() {
  ReactDOM.render(
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
