import { useEffect, useState } from "react";
import { MainView } from "./MainView";
import { useWallet } from "./context/WalletProvider";
import { makeStyles, Typography, Box, Button } from "@material-ui/core";
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
import YouTubeIcon from "@material-ui/icons/YouTube";
import TwitterIcon from "@material-ui/icons/Twitter";
import GitHubIcon from "@material-ui/icons/GitHub";
import { DiscordIcon } from "./shared/components/DiscordIcon";
import { LinkTo } from "./shared/components/LinkTo";

const useStyles = makeStyles((theme) => ({
  body: {
    marginTop: "30px"
  },
  footer: {
    top: "auto",
    bottom: 0,
    padding: "2px 1rem",
    display: "flex",
    justifyContent: "space-between"
  },
  socialLinks: {
    display: "flex",
    transition: ".3s all ease",
    margin: 0,
    padding: 0,
    "& li": {
      margin: "0 .5rem"
    },
    "& path": {
      fill: theme.palette.common.black,
      transition: ".3s all ease"
    }
  },
  socialIcon: {
    height: "1.5rem",
    width: "1.5rem",
    fontSize: "3rem",
    display: "block",
    margin: "0 auto",
    "&:hover": {
      color: theme.palette.primary.main,
      "& path": {
        fill: theme.palette.primary.main
      }
    }
  },
  caption: {
    color: theme.palette.grey["600"],
    fontWeight: "bold",
    fontSize: ".6rem"
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

            <Box display="flex" alignItems="center">
              <Box marginRight="1rem">
                <Button
                  onClick={() => window.electron.openUrl("https://www.mintscan.io/akash/validators/akashvaloper14mt78hz73d9tdwpdvkd59ne9509kxw8yj7qy8f")}
                  size="small"
                >
                  <Typography variant="caption" className={classes.caption}>
                    Validator
                  </Typography>
                </Button>
              </Box>

              <ul className={classes.socialLinks}>
                <li>
                  <LinkTo onClick={() => window.electron.openUrl("https://discord.gg/rXDFNYnFwv")} className={classes.socialLink}>
                    <DiscordIcon className={classes.socialIcon} />
                  </LinkTo>
                </li>
                <li>
                  <LinkTo
                    onClick={() => window.electron.openUrl("https://www.youtube.com/channel/UC1rgl1y8mtcQoa9R_RWO0UA?sub_confirmation=1")}
                    className={classes.socialLink}
                  >
                    <YouTubeIcon className={classes.socialIcon} />
                  </LinkTo>
                </li>
                <li>
                  <LinkTo onClick={() => window.electron.openUrl("https://twitter.com/akashlytics")} className={classes.socialLink}>
                    <TwitterIcon className={classes.socialIcon} />
                  </LinkTo>
                </li>
                <li>
                  <LinkTo onClick={() => window.electron.openUrl("https://github.com/Akashlytics/akashlytics-deploy")} className={classes.socialLink}>
                    <GitHubIcon className={classes.socialIcon} />
                  </LinkTo>
                </li>
              </ul>
            </Box>
          </footer>
        )}
      </div>
    </>
  );
};
