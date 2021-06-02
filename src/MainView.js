import { useState } from "react";
import './App.css';
import { MemoryRouter, Route } from "react-router-dom";
import { makeStyles, Grid } from '@material-ui/core';
import WalletImport from './WalletImport';
import WalletOpen from "./WalletOpen";
import { CreateDeploymentWizard } from "./CreateDeploymentWizard/CreateDeploymentWizard";
import { DeploymentList } from "./DeploymentList";
import { WalletDisplay } from "./WalletDisplay";
import { CertificateDisplay } from "./CertificateDisplay";
import { DeploymentDetail } from "./components/DeploymentDetail";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
}));

export function MainView(props) {
  const [deployments, setDeployments] = useState([]);

  const { balance, refreshBalance, selectedWallet, address, handleWalletOpen } = props;

  const classes = useStyles();

  const walletExists = localStorage.getItem("Wallet") !== null;

  if (!selectedWallet || !address) {
    return walletExists ?
      <WalletOpen onWalletOpen={handleWalletOpen} />
      : <WalletImport onWalletOpen={handleWalletOpen} />
  }

  return (
    <div className={classes.root}>
      <Grid container pt={2} spacing={1}>
        <Grid item xs={6}>
          <WalletDisplay balance={balance} refreshBalance={refreshBalance} selectedWallet={selectedWallet} address={address} />
        </Grid>

        <Grid item xs={6}>
          <CertificateDisplay selectedWallet={selectedWallet} address={address} />
        </Grid>

        <Grid item xs={12}>
          <MemoryRouter
            initialEntries={["/"]}
            initialIndex={1}
          >
            <Route exact path="/createDeployment">
              <CreateDeploymentWizard refreshBalance={refreshBalance} address={address} selectedWallet={selectedWallet} />
            </Route>
            <Route path="/deployment/:dseq">
              <DeploymentDetail deployments={deployments} address={address} selectedWallet={selectedWallet} />
            </Route>
            <Route exact path="/">
              <DeploymentList deployments={deployments} setDeployments={setDeployments} address={address} selectedWallet={selectedWallet} />
            </Route>
          </MemoryRouter>
        </Grid>
      </Grid>
    </div>
  );
}