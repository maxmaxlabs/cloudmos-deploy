import { makeStyles, Button, Dialog, DialogContent, DialogActions, DialogTitle } from "@material-ui/core";
import { ProviderDetailContent } from "./ProviderDetailContent";

const useStyles = makeStyles((theme) => ({
  content: {
    padding: "1rem"
  }
}));

export const ProviderDetailModal = ({ provider, address, onClose }) => {
  const classes = useStyles();

  return (
    <Dialog maxWidth="xs" aria-labelledby="provider-detail-dialog-title" open={true} onClose={onClose}>
      <DialogTitle id="provider-detail-dialog-title">Provider Details</DialogTitle>
      <DialogContent dividers className={classes.content}>
        <ProviderDetailContent provider={provider} address={address} />
      </DialogContent>
      <DialogActions>
        <Button autoFocus variant="contained" onClick={onClose} color="primary" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
