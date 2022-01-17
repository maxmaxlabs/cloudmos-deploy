import { useState } from "react";
import {
  makeStyles,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { uaktToAKT, aktToUakt } from "../../shared/utils/priceUtils";
import { LinkTo } from "../../shared/components/LinkTo";
import { useWallet } from "../../context/WalletProvider";

const useStyles = makeStyles((theme) => ({
  alert: {
    marginTop: "1rem"
  }
}));

export const SendModal = ({ onClose, onSendTransaction }) => {
  const classes = useStyles();
  const [recipient, setRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState(0);
  const [isBalanceClicked, setIsBalanceClicked] = useState(false);
  const [error, setError] = useState("");
  const { balance } = useWallet();

  const onBalanceClick = () => {
    setIsBalanceClicked((prev) => !prev);
    setSendAmount(uaktToAKT(balance, 6));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    const amount = aktToUakt(sendAmount);

    if (!recipient) {
      setError(`You must set a recipient.`);
      return;
    }

    if (amount > balance) {
      setError(`You can't send more than you currently have in your balance. Current balance is: ${uaktToAKT(amount, 6)}AKT.`);
      return;
    }

    onSendTransaction(recipient, amount);
  };

  return (
    <Dialog disableBackdropClick disableEscapeKeyDown maxWidth="xs" fullWidth aria-labelledby="send-transaction-dialog-title" open={true} onExit={onClose}>
      <DialogTitle id="send-transaction-dialog-title">Send tokens</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="send-transaction-recipient">Recipient</InputLabel>
            <OutlinedInput
              id="send-transaction-recipient"
              value={recipient}
              onChange={(ev) => {
                setError("");
                setRecipient(ev.target.value);
              }}
              labelWidth={60}
              autoFocus
            />
          </FormControl>

          <Box marginBottom=".5rem" marginTop=".5rem" textAlign="right">
            <LinkTo onClick={() => onBalanceClick()}>Balance: {uaktToAKT(balance, 6)} AKT</LinkTo>
          </Box>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="send-transaction-amount">Amount</InputLabel>
            <OutlinedInput
              id="send-transaction-amount"
              value={sendAmount}
              onChange={(ev) => {
                setError("");
                setSendAmount(ev.target.value);
              }}
              startAdornment={<InputAdornment position="start">AKT</InputAdornment>}
              labelWidth={60}
              type="number"
              inputProps={{ min: 0, step: 0.000001 }}
              disabled={isBalanceClicked}
              autoFocus
            />
          </FormControl>
          {error && (
            <Alert severity="warning" className={classes.alert}>
              {error}
            </Alert>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!sendAmount || !!error} variant="contained" color="secondary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
