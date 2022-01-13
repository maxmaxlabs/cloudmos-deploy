import { useState } from "react";
import { makeStyles, AppBar, Toolbar, Chip, Typography, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  betaChip: {
    fontWeight: "bold"
  },
  betaText: {
    padding: "0 1rem"
  }
}));

export const BetaBanner = () => {
  const [isBetaBarVisible, setIsBetaBarVisible] = useState(true);
  const classes = useStyles();

  const onCloseClick = () => {
    localStorage.setItem("isBetaBannerSeen", true);

    setIsBetaBarVisible(false);
  };

  return (
    <>
      {isBetaBarVisible && (
        <AppBar position="static">
          <Toolbar>
            <Chip label="BETA" color="secondary" className={classes.betaChip} />
            <div className={classes.betaText}>
              <Typography variant="body1">
                Akashlytics Deploy is currently in BETA. We strongly suggest you start with a new wallet and a small amount of AKT until we further stabilize
                the product. Enjoy!
              </Typography>
            </div>

            <div className={classes.grow} />
            <IconButton aria-label="Close beta app bar" color="inherit" onClick={onCloseClick}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}
    </>
  );
};
