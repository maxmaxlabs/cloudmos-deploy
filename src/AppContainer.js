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
import { AppBar, Toolbar } from "@material-ui/core";
import { LinkTo } from "./shared/components/LinkTo";

const useStyles = makeStyles((theme) => ({
  body: {
    paddingTop: "78px",
    height: "calc(100% - 78px)"
  },
  checkItOut: { marginLeft: ".5rem", fontWeight: "bold", color: theme.palette.secondary.contrastText }
}));

export const AppContainer = () => {
  const classes = useStyles();
  const [isAppInitiated, setIsAppInitiated] = useState(false);
  const { address, selectedWallet } = useWallet();
  const { wallets } = useStorageWallets();
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

    // let isBetaBannerSeen = localStorage.getItem("isBetaBannerSeen");
    // isBetaBannerSeen = !!isBetaBannerSeen && isBetaBannerSeen === "true" ? true : false;
    // setShowBetaBanner(!isBetaBannerSeen);
    setIsAppInitiated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <BetaBanner />
      <AppBar color="secondary">
        <Toolbar variant="dense" className={classes.toolbar}>
          Cloudmos Deploy desktop is now being deprecated. We're now officially in the browser!{" "}
          <LinkTo onClick={() => window.electron.openUrl("https://deploy.cloudmos.io")} className={classes.checkItOut}>
            Check it out!
          </LinkTo>
        </Toolbar>
      </AppBar>

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
