import { makeStyles, Grid, Paper, Box, AppBar, Toolbar } from "@material-ui/core";
import { WalletDisplay } from "./components/WalletDisplay";
import { CertificateDisplay } from "./components/CertificateDisplay";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { LeftNav } from "./components/LeftNav";
import { RightContent } from "./components/RightContent";
import { useEffect, useState } from "react";
import { useWallet } from "./context/WalletProvider";
import { WelcomeModal } from "./components/WelcomeModal";
import { Layout } from "./shared/components/Layout";
import { accountBarHeight } from "./shared/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%"
  },
  accountAppBar: {
    top: "30px",
    backgroundColor: theme.palette.grey[200]
  },
  accountBar: {
    height: `${accountBarHeight}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  viewContainer: {
    display: "flex",
    width: "100%",
    borderRadius: 0,
    flexGrow: 1,
    height: "100%"
  }
}));

export function MainView() {
  const classes = useStyles();
  const [isShowingWelcome, setIsShowingWelcome] = useState(false);
  const { balance } = useWallet();

  useEffect(() => {
    if (typeof balance === "number" && balance === 0 && !isShowingWelcome) {
      setIsShowingWelcome(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  return (
    <Layout marginTop={`${accountBarHeight}px`} height={`calc(100% - ${accountBarHeight}px) !important`}>
      {isShowingWelcome && <WelcomeModal open={isShowingWelcome} onClose={() => setIsShowingWelcome(false)} />}

      <Box height="100%">
        <AppBar position="fixed" color="default" elevation={0} component="header" className={classes.accountAppBar}>
          <Toolbar variant="dense" className={classes.accountBar}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <WalletDisplay />

              <CertificateDisplay />
            </ErrorBoundary>
          </Toolbar>
        </AppBar>

        <div className={classes.viewContainer}>
          <LeftNav />

          <Box flexGrow={1} marginLeft="200px">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <RightContent />
            </ErrorBoundary>
          </Box>
        </div>
      </Box>
    </Layout>
  );
}
