import React, { useState, useEffect } from "react";
import "./App.css";
import { MemoryRouter, Route } from "react-router-dom";
import { makeStyles, Grid } from "@material-ui/core";
import WalletImport from "./WalletImport";
import WalletOpen from "./WalletOpen";
import { PasswordConfirmationModalProvider } from "./ConfirmPasswordModal/ConfirmPasswordModalContext";
import { SelectManifestTemplate } from "./CreateDeploymentWizard/SelectManifestTemplate";
import { DeploymentList } from "./DeploymentList";
import { WalletDisplay } from "./WalletDisplay";
import { CertificateDisplay } from "./CertificateDisplay";
import { DeploymentDetail } from "./DeploymentDetail";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

function App() {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [cert, setCert] = useState(null);
  const [address, setAddress] = useState(null);
  const [deployments, setDeployments] = useState([]);

  const classes = useStyles();

  useEffect(() => {
    async function getAddress() {
      const [account] = await selectedWallet.getAccounts();
      setAddress(account.address);
    }
    if (selectedWallet) {
      getAddress();
    }
  }, [selectedWallet]);

  const walletExists = localStorage.getItem("Wallet") !== null;

  function handleWalletOpen(wallet, cert) {
    setSelectedWallet(wallet);
    setCert(cert);
  }

  if (!selectedWallet || !address) {
    return walletExists ? (
      <WalletOpen onWalletOpen={handleWalletOpen} />
    ) : (
      <WalletImport onWalletOpen={handleWalletOpen} />
    );
  }

  return (
    <PasswordConfirmationModalProvider>
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <WalletDisplay selectedWallet={selectedWallet} address={address} />
          </Grid>

          <Grid item xs={6}>
            <CertificateDisplay
              selectedWallet={selectedWallet}
              address={address}
            />
          </Grid>

          <Grid item xs={12}>
            <MemoryRouter initialEntries={["/"]} initialIndex={1}>
              <Route exact path="/createDeployment">
                <SelectManifestTemplate />
              </Route>
              <Route path="/deployment/:dseq">
                <DeploymentDetail
                  deployments={deployments}
                  cert={cert}
                  address={address}
                  selectedWallet={selectedWallet}
                />
              </Route>
              <Route exact path="/">
                <DeploymentList
                  deployments={deployments}
                  setDeployments={setDeployments}
                  address={address}
                  selectedWallet={selectedWallet}
                />
              </Route>
            </MemoryRouter>
          </Grid>
        </Grid>
      </div>
    </PasswordConfirmationModalProvider>
  );
}

export default App;
