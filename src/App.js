import { useRef, useEffect } from "react";
import { PasswordConfirmationModalProvider } from "./context/ConfirmPasswordModal";
import { CertificateProvider } from "./context/CertificateProvider";
import { TransactionModalProvider } from "./context/TransactionModal";
import { WalletProvider } from "./context/WalletProvider";
import { SnackbarProvider } from "notistack";
import { IconButton, makeStyles } from "@material-ui/core";
import { QueryClientProvider } from "react-query";
import { SettingsProvider } from "./context/SettingsProvider";
import { LocalNoteProvider } from "./context/LocalNoteProvider";
import { Router } from "react-router-dom";
import CloseIcon from "@material-ui/icons/Close";
import { createMemoryHistory } from "history";
import { HelmetProvider } from "react-helmet-async";
import { Helmet } from "react-helmet-async";
import { analytics, HOSTNAME } from "./shared/utils/analyticsUtils";
import { queryClient } from "./queries";
import { AppContainer } from "./AppContainer";

// const ipcApi = window.electron.api;

let history = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 1
});

const useStyles = makeStyles((theme) => ({
  snackbarRoot: {
    maxWidth: "300px"
  },
  snackbarClose: {
    color: "#ffffff"
  },
  footer: {
    top: "auto",
    bottom: 0,
    padding: "2px 1rem"
  }
}));

function App() {
  const notistackRef = useRef();
  const classes = useStyles();

  const onClickDismiss = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  useEffect(() => {
    const init = async () => {
      await analytics.pageview(HOSTNAME, window.location.pathname + window.location.search, document.title);
    };

    history.listen(async (location, action) => {
      try {
        await analytics.pageview(HOSTNAME, location.pathname + location.search, document.title);
      } catch (error) {
        console.log(error);
      }
    });

    init();
  }, []);

  // useEffect(() => {
  // ipcApi.receive("update_available", () => {
  //   ipcApi.removeAllListeners("update_available");
  //   console.log("A new update is available. Downloading now...");
  //   // TODO show a toast for update
  // });
  // ipcApi.receive("update_downloaded", () => {
  //   ipcApi.removeAllListeners("update_downloaded");
  //   console.log("Update Downloaded. It will be installed on restart. Restart now?");
  //   // TODO Handle click button to send restart
  //   // ipcRenderer.send('restart_app');
  // });
  // }, [])

  return (
    <Router history={history}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            ref={notistackRef}
            action={(key) => (
              <IconButton onClick={onClickDismiss(key)} className={classes.snackbarClose}>
                <CloseIcon />
              </IconButton>
            )}
            classes={{ root: classes.snackbarRoot }}
            dense
          >
            <SettingsProvider>
              <WalletProvider>
                <TransactionModalProvider>
                  <PasswordConfirmationModalProvider>
                    <CertificateProvider>
                      <LocalNoteProvider>
                        <Helmet defaultTitle="Akashlytics Deploy" titleTemplate="Akashlytics Deploy - %s" />

                        <AppContainer />
                      </LocalNoteProvider>
                    </CertificateProvider>
                  </PasswordConfirmationModalProvider>
                </TransactionModalProvider>
              </WalletProvider>
            </SettingsProvider>
          </SnackbarProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App;
