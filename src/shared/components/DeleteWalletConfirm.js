import { useState } from "react";
import { makeStyles, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { uaktToAKT } from "../../shared/utils/priceUtils";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: "1rem"
  },
  dialogActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }
}));

export const DeleteWalletConfirm = ({ isOpen, address, balance, handleCancel, handleConfirmDelete }) => {
  const classes = useStyles();
  const [isConfirmationChecked, setIsConfirmationChecked] = useState(false);
  const [deleteDeployments, setDeleteDeployments] = useState(false);

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="sm"
      aria-labelledby="confirmation-dialog-title"
      open={isOpen}
      onExit={() => setIsConfirmationChecked(false)}
    >
      <DialogTitle id="confirmation-dialog-title">Delete Wallet</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        Are you sure you want to delete this wallet?
        <p>
          Address: <strong>{address}</strong>
          <br />
          {!!balance && (
            <>
              Balance: <strong>{uaktToAKT(balance)} AKT</strong>
            </>
          )}
        </p>
        <Alert severity="warning">
          This wallet will be completely removed from Cloudmos Deploy along with your local certificate and deployments data. If you want to keep access to
          this wallet, make sure you have a backup of the seed phrase or private key.
        </Alert>
        <br />
        <FormControlLabel
          control={<Checkbox checked={deleteDeployments} onChange={(ev, value) => setDeleteDeployments(value)} />}
          label="Delete local deployment data."
        />
        <FormControlLabel
          control={<Checkbox checked={isConfirmationChecked} onChange={(ev, value) => setIsConfirmationChecked(value)} />}
          label="I understand the wallet will be completely removed and I have all the backups I need."
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button autoFocus onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={() => handleConfirmDelete(deleteDeployments)} disabled={!isConfirmationChecked} variant="contained" color="secondary">
          Delete Wallet
        </Button>
      </DialogActions>
    </Dialog>
  );
};
