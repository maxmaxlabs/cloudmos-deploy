import "./App.css";
import { useRef } from "react";
import { PasswordConfirmationModalProvider } from "./ConfirmPasswordModal/ConfirmPasswordModalContext";
import { MainView } from "./MainView";
import { CertificateProvider } from "./context/CertificateProvider/CertificateProviderContext";
import { TransactionModalProvider } from "./context/TransactionModal/TransactionModalContext";
import { WalletProvider } from "./WalletProvider/WalletProviderContext";
import { SnackbarProvider } from "notistack";
import { IconButton, makeStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  snackbarClose: {
    color: "#ffffff"
  }
}));

function App() {
  const notistackRef = useRef();
  const classes = useStyles();

  const onClickDismiss = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
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
      <WalletProvider>
        <TransactionModalProvider>
          <PasswordConfirmationModalProvider>
            <CertificateProvider>
              <MainView />
            </CertificateProvider>
          </PasswordConfirmationModalProvider>
        </TransactionModalProvider>
      </WalletProvider>
    </SnackbarProvider>
  );
}

export default App;
