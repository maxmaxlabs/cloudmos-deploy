import { useEffect, useState } from "react";
import { Button, makeStyles, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@material-ui/core";
import { useWallet } from "../../context/WalletProvider";
import { CodeSnippet } from "../../shared/components/CodeSnippet";
import { analytics } from "../../shared/utils/analyticsUtils";
import { Alert } from "@material-ui/lab";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const useStyles = makeStyles((theme) => ({
  label: {
    fontWeight: "bold"
  }
}));

export function ExportCertificate(props) {
  const { address } = useWallet();
  const [certData, setCertData] = useState(null);
  const classes = useStyles();
  const { getLocalStorageItem } = useLocalStorage();

  useEffect(() => {
    async function init() {
      const crtpem = getLocalStorageItem(address + ".crt");
      const encryptedKey = getLocalStorageItem(address + ".key");

      await analytics.event("deploy", "export certificate");

      setCertData({ crtpem, encryptedKey });
    }

    init();
  }, []);

  return (
    <Dialog open={props.isOpen} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle id="simple-dialog-title">Export certificate</DialogTitle>
      <DialogContent dividers>
        {certData && certData.crtpem && certData.encryptedKey ? (
          <>
            <Typography variant="body1" className={classes.label}>
              Cert
            </Typography>
            <CodeSnippet code={certData.crtpem} />
            <Typography variant="body1" className={classes.label}>
              Key
            </Typography>
            <CodeSnippet code={certData.encryptedKey} />
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
