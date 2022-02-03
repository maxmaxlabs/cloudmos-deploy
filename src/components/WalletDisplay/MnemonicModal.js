import { Button, makeStyles, Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import { useWallet } from "../../context/WalletProvider";
import { MnemonicTextarea } from "../../shared/components/MnemonicTextarea";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: "1rem"
  }
}));

export function MnemonicModal(props) {
  const { selectedWallet } = useWallet();
  const classes = useStyles();

  return (
    <Dialog open={true} onClose={props.onClose} maxWidth="xs" fullWidth>
      <DialogTitle id="simple-dialog-title">View mnemonic seed</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <MnemonicTextarea mnemonic={selectedWallet?.mnemonic} />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={props.onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
