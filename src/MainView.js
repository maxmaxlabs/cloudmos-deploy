import { makeStyles, Grid, Paper, Box } from "@material-ui/core";
import { WalletDisplay } from "./components/WalletDisplay";
import { CertificateDisplay } from "./components/CertificateDisplay";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { LeftNav } from "./components/LeftNav";
import { RightContent } from "./components/RightContent";
import { useEffect, useState } from "react";
import { useWallet } from "./context/WalletProvider";
import { WelcomeModal } from "./components/WelcomeModal";

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
  const classes = useStyles();
  const [isShowingWelcome, setIsShowingWelcome] = useState(false);
  const { balance } = useWallet();

  useEffect(() => {
    if (balance === 0 && !isShowingWelcome) {
      setIsShowingWelcome(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  return (
    <div className={classes.root}>
      {isShowingWelcome && <WelcomeModal open={isShowingWelcome} onClose={() => setIsShowingWelcome(false)} />}

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

            <Box flexGrow={1} style={{ overflowX: "hidden" }}>
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
