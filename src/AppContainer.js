import { useEffect, useState } from "react";
import { MainView } from "./MainView";
import { useWallet } from "./context/WalletProvider";
import { makeStyles } from "@material-ui/core";
import { Route, useHistory } from "react-router-dom";
import { BetaBanner } from "./components/BetaBanner";
import { UrlService } from "./shared/utils/urlUtils";
import { useStorageWallets } from "./shared/utils/walletUtils";
import { WalletOpen } from "./routes/WalletOpen";
import { WalletImport } from "./routes/WalletImport";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { NodeStatusBar } from "./components/NodeStatusBar";
import { Register } from "./routes/Register";
import { NewWallet } from "./routes/NewWallet";
import { Footer } from "./components/Footer";

const useStyles = makeStyles((theme) => ({
  body: {
    paddingTop: "30px",
    height: "calc(100% - 30px)"
  }
}));

export const AppContainer = () => {
  const classes = useStyles();
  const [isAppInitiated, setIsAppInitiated] = useState(false);
  const { address, selectedWallet } = useWallet();
  const { wallets } = useStorageWallets();
  const [showBetaBanner, setShowBetaBanner] = useState(false);
  const history = useHistory();

  const walletsExist = wallets.length > 0;

  useEffect(() => {
    // Redirect to wallet import or open when no current selected wallet
    if (!selectedWallet || !address) {
      if (walletsExist) {
        history.replace(UrlService.walletOpen());
      } else {
        history.replace(UrlService.register());
      }
    }

    let isBetaBannerSeen = localStorage.getItem("isBetaBannerSeen");
    isBetaBannerSeen = !!isBetaBannerSeen && isBetaBannerSeen === "true" ? true : false;
    setShowBetaBanner(!isBetaBannerSeen);
    setIsAppInitiated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {showBetaBanner && <BetaBanner />}
      <NodeStatusBar />

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

        {isAppInitiated && selectedWallet && address && <MainView />}
      </div>

      <Footer />
    </>
  );
};
