import { useRef, useEffect } from "react";
import { PasswordConfirmationModalProvider } from "./context/ConfirmPasswordModal";
import { MainView } from "./MainView";
import { CertificateProvider } from "./context/CertificateProvider";
import { TransactionModalProvider } from "./context/TransactionModal";
import { WalletProvider } from "./context/WalletProvider";
import { SnackbarProvider } from "notistack";
import { IconButton, makeStyles, AppBar, Typography } from "@material-ui/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { SettingsProvider } from "./context/SettingsProvider";
import { LocalNoteProvider } from "./context/LocalNoteProvider";
import { Router } from "react-router-dom";
import { BetaBanner } from "./components/BetaBanner";
import { useAppVersion } from "./hooks/useAppVersion";
import CloseIcon from "@material-ui/icons/Close";
import { createMemoryHistory } from "history";
import { HelmetProvider } from "react-helmet-async";
import { Helmet } from "react-helmet-async";
import { analytics, HOSTNAME } from "./shared/utils/analyticsUtils";

const ipcApi = window.electron.api;

let history = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 1
});

const useStyles = makeStyles((theme) => ({
  snackbarClose: {
    color: "#ffffff"
  },
  footer: {
    top: "auto",
    bottom: 0,
    padding: "2px 1rem"
  }
}));

const queryClient = new QueryClient();

function App() {
  const notistackRef = useRef();
  const classes = useStyles();
  const { appVersion } = useAppVersion();

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
            dense
          >
            <SettingsProvider>
              <WalletProvider>
                <TransactionModalProvider>
                  <PasswordConfirmationModalProvider>
                    <CertificateProvider>
                      <LocalNoteProvider>
                        <Helmet defaultTitle="Akashlytics Deploy" titleTemplate="Akashlytics Deploy - %s" />

                        <BetaBanner />
                        <MainView />

                        {appVersion && (
                          <footer className={classes.footer}>
                            <Typography variant="caption">
                              Version: <strong>v{appVersion}</strong>
                            </Typography>
                          </footer>
                        )}
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
