import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { CssBaseline, ThemeProvider, createMuiTheme } from "@material-ui/core";
import * as Sentry from "@sentry/react";

const appVersion = window.electron.getAppVersion();
const appEnvironment = window.electron.getAppEnvironment();

Sentry.init({
  dsn: "https://fc8f0d800d664154a0f1babe0e318fbb@o877251.ingest.sentry.io/5827747",
  environment: appEnvironment,
  release: appVersion
});

const theme = createMuiTheme({
  palette: {
    background: {
      // default: "#282c34"
    }
    // type: "dark"
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        html: {
          WebkitFontSmoothing: "auto"
        }
      }
    },
    MuiInputBase: {
      input: { padding: "10px 14px" }
    },
    MuiOutlinedInput: {
      input: { padding: "10px 14px" }
    },
    MuiInputLabel: {
      outlined: {
        transform: "translate(14px, 12px) scale(1)"
      }
    }
  }
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
