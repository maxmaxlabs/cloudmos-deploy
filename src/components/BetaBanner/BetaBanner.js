import { useState } from "react";
import { makeStyles, Dialog, DialogContent, DialogActions, Button, Chip, Typography, Box } from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  betaChip: {
    fontWeight: "bold"
  },
  betaText: {
    padding: "1rem"
  },
  title: {
    marginBottom: ".5rem"
  },
  appBar: {
    top: "30px"
  },
  checkItOut: { display: "flex", alignItems: "center" }
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
        <Dialog open={true} maxWidth="sm" fullWidth>
          <DialogContent className={classes.dialogContent}>
            <div className={classes.betaText}>
              <Typography variant="h5" className={classes.title}>
                <strong>
                  Important! <Chip label="deprecated" color="secondary" className={classes.betaChip} size="small" />
                </strong>
              </Typography>

              <Typography variant="body1">
                Thank you for using Cloudmos Deploy as a desktop app. We're writing to let you know that we'll be discontinuing support for this version of the
                app. We won't be providing any further updates, but don't worry - we have an exciting new version of Cloudmos Deploy available in your browser.
              </Typography>
              <br />
              <Typography variant="body1">
                Our new browser version offers an improved experience, with all the same great features you're used to. We believe that you'll love it just as
                much as the desktop app, if not more.
              </Typography>
              <br />

              <Typography variant="body1">
                Thank you for choosing Cloudmos Deploy, and we hope to see you using our new browser version soon. If you have any questions or concerns, please
                don't hesitate to reach out to our support team.
              </Typography>
              <br />

              <Button
                variant="contained"
                color="secondary"
                onClick={() => window.electron.openUrl("https://deploy.cloudmos.io")}
                classes={{ label: classes.checkItOut }}
              >
                Check it out!{" "}
                <Box component="span" marginLeft=".5rem" display="flex">
                  <LaunchIcon />
                </Box>
              </Button>
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onCloseClick} type="button" color="primary">
              Got it
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
