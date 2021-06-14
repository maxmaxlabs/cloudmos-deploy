import { useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import { makeStyles, Grid, Paper, Box } from "@material-ui/core";
import { WalletImport } from "./components/WalletImport";
import { WalletOpen } from "./components/WalletOpen";
import { CreateDeploymentWizard } from "./routes/CreateDeploymentWizard";
import { DeploymentList } from "./routes/DeploymentList";
import { WalletDisplay } from "./components/WalletDisplay";
import { CertificateDisplay } from "./components/CertificateDisplay";
import { DeploymentDetail } from "./routes/DeploymentDetail";
import { useWallet } from "./context/WalletProvider";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { LeftNav } from "./components/LeftNav";
import { useDeploymentList } from "./queries";
import { Dashboard } from "./routes/Dashboard";
import { Settings } from "./routes/Settings";
import { useQueryParams } from "./hooks/useQueryParams";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: "20px"
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  viewContainer: {
    display: "flex",
    width: "100%"
  }
}));

export function MainView() {
  const history = useHistory();
  const params = useQueryParams();
  const { address, selectedWallet } = useWallet();
  const { data: deployments, isLoading: isLoadingDeployments, refetch } = useDeploymentList(address);
  const classes = useStyles();

  useEffect(() => {
    // using query params to tell react-query to refetch manually
    if (params.get("refetch") === "true") {
      refetch();

      history.replace(history.location.pathname);
    }
  }, [params, history, refetch]);

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
          <Paper className={classes.viewContainer}>
            <LeftNav />

            <Box flexGrow={1}>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Route exact path="/createDeployment/:step?/:dseq?">
                  <CreateDeploymentWizard />
                </Route>
                <Route path="/deployment/:dseq">
                  <DeploymentDetail deployments={deployments} />
                </Route>
                <Route exact path="/deployments">
                  <DeploymentList deployments={deployments} isLoadingDeployments={isLoadingDeployments} />
                </Route>
                <Route exact path="/settings">
                  <Settings />
                </Route>
                <Route exact path="/">
                  <Dashboard deployments={deployments} isLoadingDeployments={isLoadingDeployments} />
                </Route>
              </ErrorBoundary>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
