import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import * as Sentry from "@sentry/react";
import { initAnalytics } from "./shared/utils/analyticsUtils";
import { theme } from "./shared/theme";

(async () => {
  const isDev = await window.electron.isDev();
  console.log(`isDev: ${isDev}`);
  initAnalytics(isDev);

  runApp();
})();

function runApp() {
  const appVersion = window.electron.getAppVersion();
  const appEnvironment = window.electron.getAppEnvironment();

  Sentry.init({
    dsn: "https://fc8f0d800d664154a0f1babe0e318fbb@o877251.ingest.sentry.io/5827747",
    environment: appEnvironment,
    release: appVersion
  });

  ReactDOM.render(
    <React.StrictMode>
      <Sentry.ErrorBoundary fallback={({ error, resetError }) => <ErrorFallback error={error} resetErrorBoundary={resetError} />}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </Sentry.ErrorBoundary>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
