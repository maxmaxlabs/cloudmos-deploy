import { useEffect } from "react";
import { Button, makeStyles, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@material-ui/core";
import { CodeSnippet } from "../../shared/components/CodeSnippet";
import { analytics } from "../../shared/utils/analyticsUtils";
import { Alert } from "@material-ui/lab";
import { useSelectedWalletFromStorage } from "../../shared/utils/walletUtils";

const useStyles = makeStyles((theme) => ({
  label: {
    fontWeight: "bold"
  },
  dialogContent: {
    padding: "1rem"
  }
}));

export function ExportCertificate(props) {
  const classes = useStyles();
  const selectedWallet = useSelectedWalletFromStorage();

  useEffect(() => {
    async function init() {
      await analytics.event("deploy", "export certificate");
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={props.isOpen} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export certificate</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        {selectedWallet && selectedWallet.cert && selectedWallet.certKey ? (
          <>
            <Typography variant="body1" className={classes.label}>
              Cert
            </Typography>
            <CodeSnippet code={selectedWallet.cert} />
            <Typography variant="body1" className={classes.label}>
              Key
            </Typography>
            <CodeSnippet code={selectedWallet.certKey} />
          </>
        ) : (
          <Alert severity="warning">
            Unable to find local certificate. Meaning you have a certificate on chain but not in the tool. We suggest you regenerate a new one to be able to use
            the tool properly.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={props.onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
