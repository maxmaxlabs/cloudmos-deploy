import { makeStyles, Box, AppBar, Toolbar } from "@material-ui/core";
import { WalletDisplay } from "./components/WalletDisplay";
import { CertificateDisplay } from "./components/CertificateDisplay";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./shared/components/ErrorFallback";
import { LeftNav, drawerWidth, closedDrawerWidth } from "./components/LeftNav";
import { RightContent } from "./components/RightContent";
import { useState } from "react";
import { Layout } from "./shared/components/Layout";
import { accountBarHeight } from "./shared/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%"
  },
  accountAppBar: {
    top: "78px",
    backgroundColor: theme.palette.grey[300]
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
  },
  viewContentContainer: {
    flexGrow: 1,
    overflowX: "hidden",
    transition: "margin-left .3s ease"
  }
}));

export function MainView() {
  const classes = useStyles();
  const [isNavOpen, setIsNavOpen] = useState(true);

  const onOpenMenuClick = () => {
    setIsNavOpen((prev) => !prev);
  };

  return (
    <Layout marginTop={`${accountBarHeight}px`} height={`calc(100% - ${accountBarHeight}px) !important`}>
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
          <LeftNav onOpenMenuClick={onOpenMenuClick} isNavOpen={isNavOpen} />

          <Box className={classes.viewContentContainer} style={{ marginLeft: isNavOpen ? `${drawerWidth}px` : `${closedDrawerWidth}px` }}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <RightContent />
            </ErrorBoundary>
          </Box>
        </div>
      </Box>
    </Layout>
  );
}
