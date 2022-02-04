import { useEffect, useState } from "react";
import { MainView } from "./MainView";
import { useWallet } from "./context/WalletProvider";
import { makeStyles, Typography } from "@material-ui/core";
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
import { Register } from "./routes/Register";
import { NewWallet } from "./routes/NewWallet";

const useStyles = makeStyles((theme) => ({
  body: {
    marginTop: "30px"
  },
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
  const { addresses } = useStorageWalletAddresses();
  const [showBetaBanner, setShowBetaBanner] = useState(false);
  const history = useHistory();

  const walletExists = addresses?.length > 0;

  useEffect(() => {
    // Redirect to wallet import or open when no current selected wallet
    if (!selectedWallet || !address) {
      if (walletExists) {
        history.replace(UrlService.walletOpen());
      } else {
        history.replace(UrlService.register());
      }
    }

    const isBetaBannerSeen = Boolean(localStorage.getItem("isBetaBannerSeen"));
    setShowBetaBanner(!isBetaBannerSeen);
    setIsAppInitiated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <NodeStatusBar />
      {showBetaBanner && <BetaBanner />}

      <div className={classes.body}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Route exact path="/register">
            <Register />
          </Route>
          <Route exact path="/new-wallet">
            <NewWallet />
          </Route>
          <Route exact path="/wallet-import">
            <WalletImport />
          </Route>
          <Route exact path="/wallet-open">
            <WalletOpen />
          </Route>
        </ErrorBoundary>

        {isAppInitiated && selectedWallet && address && (
          <>
            <MainView />
          </>
        )}

        {appVersion && (
          <footer className={classes.footer}>
            <Typography variant="caption">
              Version: <strong>v{appVersion}</strong>
            </Typography>

            {/** Add social media links */}
          </footer>
        )}
      </div>
    </>
  );
};
