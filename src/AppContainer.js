import { useEffect, useState } from "react";
import { MainView } from "./MainView";
import { useWallet } from "./context/WalletProvider";
import { Box, CircularProgress, makeStyles, Typography } from "@material-ui/core";
import { useSettings } from "./context/SettingsProvider";
import { Route, useHistory } from "react-router-dom";
import { BetaBanner } from "./components/BetaBanner";
import { useAppVersion } from "./hooks/useAppVersion";
import { UrlService } from "./shared/utils/urlUtils";
import { useStorageWalletAddresses } from "./shared/utils/walletUtils";
import { WalletOpen } from "./routes/WalletOpen";
import { WalletImport } from "./routes/WalletImport";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { NodeStatusBar } from "./components/NodeStatusBar";
import { useSnackbar } from "notistack";

const ipcApi = window.electron.api;

const useStyles = makeStyles((theme) => ({
  footer: {
    top: "auto",
    bottom: 0,
    padding: "2px 1rem"
  }
}));

export const AppContainer = () => {
  const classes = useStyles();
  const { appVersion } = useAppVersion();
  const [isAppInitiated, setIsAppInitiated] = useState(false);
  const { address, selectedWallet } = useWallet();
  const { isLoadingSettings } = useSettings();
  const { addresses } = useStorageWalletAddresses();
  const history = useHistory();
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const walletExists = addresses?.length > 0;

  useEffect(() => {
    // Redirect to wallet import or open when no current selected wallet
    if (!selectedWallet || !address) {
      if (walletExists) {
        history.replace(UrlService.walletOpen());
      } else {
        history.replace(UrlService.walletImport());
      }
    }

    ipcApi.receive("update_available", () => {
      debugger;
      ipcApi.removeAllListeners("update_available");

      enqueueSnackbar("A new update is available. Downloading now...", { variant: "info" });
    });
    ipcApi.receive("update_downloaded", () => {
      debugger;
      ipcApi.removeAllListeners("update_downloaded");

      enqueueSnackbar("Update Downloaded. It will be installed on restart. Restart now?", { variant: "info" });

      // TODO Handle click button to send restart
      // ipcApi.send("restart_app");
    });

    setIsAppInitiated(true);
  }, []);

  return (
    <>
      {isLoadingSettings ? (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" width="100%" flexDirection="column">
          <Box paddingBottom="1rem">
            <CircularProgress size="3rem" />
          </Box>
          <div>
            <Typography variant="h5">Loading settings...</Typography>
          </div>
        </Box>
      ) : (
        <>
          <BetaBanner />

          <Route exact path="/wallet-import">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <WalletImport />
            </ErrorBoundary>
          </Route>
          <Route exact path="/wallet-open">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <WalletOpen />
            </ErrorBoundary>
          </Route>

          {isAppInitiated && selectedWallet && address && (
            <>
              <NodeStatusBar />
              <MainView />
            </>
          )}

          {appVersion && (
            <footer className={classes.footer}>
              <Typography variant="caption">
                Version: <strong>v{appVersion}</strong>
              </Typography>
            </footer>
          )}
        </>
      )}
    </>
  );
};
