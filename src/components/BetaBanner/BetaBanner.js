import { useState } from "react";
import { makeStyles, Dialog, DialogContent, DialogActions, Button, Chip, Typography, Box } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  betaChip: {
    fontWeight: "bold",
    width: "100%"
  },
  betaText: {
    padding: "0 1rem"
  },
  appBar: {
    top: "30px"
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
        <Dialog open={true} maxWidth="xs" fullWidth>
          <DialogContent className={classes.dialogContent}>
            <Typography variant="h3">
              <strong>Welcome!</strong>
            </Typography>
            <Box padding="1rem 0">
              <Chip label="BETA" color="secondary" className={classes.betaChip} size="small" />
            </Box>
            <div className={classes.betaText}>
              <Typography variant="body1">
                <strong>Cloudmos Deploy</strong> is currently in <strong>BETA</strong>. We strongly suggest you start with a new wallet and a small amount of
                AKT until we further stabilize the product. Enjoy!
              </Typography>
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onCloseClick} type="button" color="primary">
              Got it!
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
