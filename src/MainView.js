import { makeStyles, Grid, Paper, Box, CircularProgress, Typography } from "@material-ui/core";
import { WalletImport } from "./components/WalletImport";
import { WalletOpen } from "./components/WalletOpen";
import { WalletDisplay } from "./components/WalletDisplay";
import { CertificateDisplay } from "./components/CertificateDisplay";
import { useWallet } from "./context/WalletProvider";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { LeftNav } from "./components/LeftNav";
import { RightContent } from "./components/RightContent";
import { getWalletAddresses } from "./shared/utils/walletUtils";
import { useSettings } from "./context/SettingsProvider";

const useStyles = makeStyles((theme) => ({
  root: {},
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    borderRadius: 0
  },
  viewContainer: {
    display: "flex",
    width: "100%",
    minHeight: 300,
    borderRadius: 0
  }
}));

export function MainView() {
  const { address, selectedWallet } = useWallet();
  const { isLoadingSettings } = useSettings();
  const classes = useStyles();

  const walletExists = getWalletAddresses().length > 0;

  if (isLoadingSettings) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%" width="100%" flexDirection="column">
        <Box paddingBottom="1rem">
          <CircularProgress size="3rem" />
        </Box>
        <div>
          <Typography variant="h5">Loading settings...</Typography>
        </div>
      </Box>
    );
  }

  if (!selectedWallet || !address) {
    return <ErrorBoundary FallbackComponent={ErrorFallback}>{walletExists ? <WalletOpen /> : <WalletImport />}</ErrorBoundary>;
  }

  return (
    <div className={classes.root}>
      <Grid container pt={2}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Grid item xs={6}>
            <WalletDisplay />
          </Grid>

          <Grid item xs={6}>
            <CertificateDisplay />
          </Grid>
        </ErrorBoundary>

        <Grid item xs={12}>
          <Paper className={classes.viewContainer} variant="outlined">
            <LeftNav />

            <Box flexGrow={1}>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <RightContent />
              </ErrorBoundary>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
