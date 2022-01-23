import { makeStyles, Button, Dialog, DialogContent, DialogActions, DialogTitle, Box } from "@material-ui/core";
import { Address } from "../../shared/components/Address";
import QRCode from "react-qr-code";
import { copyTextToClipboard } from "../../shared/utils/copyClipboard";
import { Snackbar } from "../../shared/components/Snackbar";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  content: {
    textAlign: "center"
  }
}));

export const DepositModal = ({ address, onClose, onSendTransaction }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const onQRClick = () => {
    copyTextToClipboard(address);
    enqueueSnackbar(<Snackbar title="Address copied to clipboard!" />, {
      variant: "success",
      autoHideDuration: 2000
    });
  };

  return (
    <Dialog maxWidth="xs" aria-labelledby="deposit-dialog-title" open={true} onClose={onClose}>
      <DialogTitle id="deposit-dialog-title">Deposit</DialogTitle>
      <DialogContent dividers className={classes.content}>
        <Box fontSize="1rem">
          <Address address={address} isCopyable />
        </Box>

        <Button onClick={onQRClick}>
          <QRCode value={address} />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button autoFocus variant="contained" onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
