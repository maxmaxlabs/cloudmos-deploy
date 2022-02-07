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
import { AppSettingsContainer } from "./AppSettingsContainer";
import { legitPaths } from "./shared/utils/urlUtils";
import { PriceProvider } from "./context/PriceProvider";
import { IntlProvider } from "react-intl";
import { TemplatesProvider } from "./context/TemplatesProvider/TemplatesProviderContext";

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
      const shouldLog = isLegitPath(window.location.pathname);
      shouldLog && (await analytics.pageview(HOSTNAME, window.location.pathname + window.location.search, document.title));
    };

    history.listen(async (location, action) => {
      try {
        const shouldLog = isLegitPath(location.pathname);
        shouldLog && (await analytics.pageview(HOSTNAME, location.pathname + location.search, document.title));
      } catch (error) {
        console.log(error);
      }
    });

    init();
  }, []);

  const isLegitPath = (pathname) => {
    const firstPath = pathname.split("/")[1];
    return legitPaths.includes(firstPath) || firstPath === "";
  };

  return (
    <IntlProvider locale="en">
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
              <PriceProvider>
                <SettingsProvider>
                  <WalletProvider>
                    <TransactionModalProvider>
                      <PasswordConfirmationModalProvider>
                        <CertificateProvider>
                          <LocalNoteProvider>
                            <TemplatesProvider>
                              <Helmet defaultTitle="Akashlytics Deploy" titleTemplate="Akashlytics Deploy - %s" />

                              <AppSettingsContainer />
                            </TemplatesProvider>
                          </LocalNoteProvider>
                        </CertificateProvider>
                      </PasswordConfirmationModalProvider>
                    </TransactionModalProvider>
                  </WalletProvider>
                </SettingsProvider>
              </PriceProvider>
            </SnackbarProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </Router>
    </IntlProvider>
  );
}

export default App;
