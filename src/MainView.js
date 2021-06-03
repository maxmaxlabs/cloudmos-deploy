import { useState } from "react";
import "./App.css";
import { MemoryRouter, Route } from "react-router-dom";
import { makeStyles, Grid } from "@material-ui/core";
import WalletImport from "./WalletImport";
import WalletOpen from "./WalletOpen";
import { CreateDeploymentWizard } from "./CreateDeploymentWizard/CreateDeploymentWizard";
import { DeploymentList } from "./DeploymentList";
import { WalletDisplay } from "./WalletDisplay";
import { CertificateDisplay } from "./CertificateDisplay";
import { DeploymentDetail } from "./components/DeploymentDetail";
import { useWallet } from "./WalletProvider/WalletProviderContext";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./shared/components/ErrorFallback";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

export function MainView() {
  const [deployments, setDeployments] = useState([]);

  const { address, selectedWallet } = useWallet();

  const classes = useStyles();

  const walletExists = localStorage.getItem("Wallet") !== null;

  if (!selectedWallet || !address) {
    return walletExists ? <WalletOpen /> : <WalletImport />;
  }

  return (
    <div className={classes.root}>
      <Grid container pt={2} spacing={1}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Grid item xs={6}>
            <WalletDisplay />
          </Grid>

          <Grid item xs={6}>
            <CertificateDisplay />
          </Grid>
        </ErrorBoundary>

        <Grid item xs={12}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <MemoryRouter initialEntries={["/"]} initialIndex={1}>
              <Route exact path="/createDeployment/:step?/:dseq?">
                <CreateDeploymentWizard />
              </Route>
              <Route path="/deployment/:dseq">
                <DeploymentDetail deployments={deployments} />
              </Route>
              <Route exact path="/">
                <DeploymentList deployments={deployments} setDeployments={setDeployments} />
              </Route>
            </MemoryRouter>
          </ErrorBoundary>
        </Grid>
      </Grid>
    </div>
  );
}
