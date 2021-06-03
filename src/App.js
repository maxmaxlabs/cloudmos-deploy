import "./App.css";
import { useRef } from "react";
import { PasswordConfirmationModalProvider } from "./ConfirmPasswordModal/ConfirmPasswordModalContext";
import { MainView } from "./MainView";
import { CertificateProvider } from "./CertificateProvider/CertificateProviderContext";
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
    >
      <PasswordConfirmationModalProvider>
        <WalletProvider>
          <CertificateProvider>
            <MainView />
          </CertificateProvider>
        </WalletProvider>
      </PasswordConfirmationModalProvider>
    </SnackbarProvider>
  );
}

export default App;
