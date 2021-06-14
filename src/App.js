import { useRef } from "react";
import { PasswordConfirmationModalProvider } from "./context/ConfirmPasswordModal";
import { MainView } from "./MainView";
import { CertificateProvider } from "./context/CertificateProvider";
import { TransactionModalProvider } from "./context/TransactionModal";
import { WalletProvider } from "./context/WalletProvider";
import { SnackbarProvider } from "notistack";
import { IconButton, makeStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { QueryClient, QueryClientProvider } from "react-query";
import { SettingsProvider } from "./context/SettingsProvider";
import { MemoryRouter } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  snackbarClose: {
    color: "#ffffff"
  }
}));

const queryClient = new QueryClient();

function App() {
  const notistackRef = useRef();
  const classes = useStyles();

  const onClickDismiss = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <MemoryRouter initialEntries={["/"]} initialIndex={1}>
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
                    <MainView />
                  </CertificateProvider>
                </PasswordConfirmationModalProvider>
              </TransactionModalProvider>
            </WalletProvider>
          </SettingsProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

export default App;
