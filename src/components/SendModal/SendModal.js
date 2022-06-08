import { useState, useRef } from "react";
import { makeStyles, Box, Button, Dialog, DialogContent, DialogActions, DialogTitle, FormControl, InputAdornment, TextField, Chip } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { uaktToAKT, aktToUakt } from "../../shared/utils/priceUtils";
import { LinkTo } from "../../shared/components/LinkTo";
import { useWallet } from "../../context/WalletProvider";
import { Controller, useForm } from "react-hook-form";
import { txFeeBuffer } from "../../shared/utils/blockchainUtils";

const useStyles = makeStyles((theme) => ({
  alert: {
    marginTop: "1rem"
  },
  dialogContent: {
    padding: "1rem"
  },
  dialogActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }
}));

export const SendModal = ({ onClose, onSendTransaction }) => {
  const classes = useStyles();
  const formRef = useRef();
  const [isBalanceClicked, setIsBalanceClicked] = useState(false);
  const [error, setError] = useState("");
  const { balance } = useWallet();
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    clearErrors
  } = useForm({
    defaultValues: {
      recipient: "",
      sendAmount: 0
    }
  });
  const { recipient } = watch();

  const onBalanceClick = () => {
    setIsBalanceClicked((prev) => !prev);
    setError("");
    clearErrors();
    setValue("sendAmount", uaktToAKT(balance - txFeeBuffer, 6));
  };

  const onSubmit = ({ sendAmount }) => {
    clearErrors();
    const amount = aktToUakt(sendAmount);

    if (!recipient) {
      setError(`You must set a recipient.`);
      return;
    }

    if (amount > balance) {
      setError(`You can't send more than you currently have in your balance. Current balance is: ${uaktToAKT(amount, 6)}AKT.`);
      return;
    }

    onSendTransaction(recipient.trim(), amount);
  };

  const onContinueClick = (event) => {
    event.preventDefault();
    formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  return (
    <Dialog maxWidth="xs" fullWidth aria-labelledby="send-transaction-dialog-title" open={true} onClose={onClose}>
      <DialogTitle id="send-transaction-dialog-title">Send tokens</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          <FormControl error={!errors.recipient} className={classes.formControl} fullWidth>
            <Controller
              control={control}
              name="recipient"
              rules={{
                required: true
              }}
              render={({ fieldState, field }) => {
                const helperText = "Recipient is required.";

                return (
                  <TextField
                    {...field}
                    type="text"
                    variant="outlined"
                    label="Recipient"
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && helperText}
                    className={classes.formValue}
                  />
                );
              }}
            />
          </FormControl>

          <Box marginBottom=".5rem" marginTop=".5rem" textAlign="right">
            <LinkTo onClick={() => onBalanceClick()}>Balance: {uaktToAKT(balance, 6)} AKT</LinkTo>
          </Box>

          <FormControl error={!errors.sendAmount} className={classes.formControl} fullWidth>
            <Controller
              control={control}
              name="sendAmount"
              rules={{
                required: true,
                validate: (value) => value > 0 && value < balance
              }}
              render={({ fieldState, field }) => {
                const helperText = fieldState.error?.type === "validate" ? "Invalid amount." : "Amount is required.";

                return (
                  <TextField
                    {...field}
                    type="number"
                    variant="outlined"
                    label="Amount"
                    autoFocus
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && helperText}
                    className={classes.formValue}
                    inputProps={{ min: 0, step: 0.000001, max: uaktToAKT(balance - txFeeBuffer, 6) }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">AKT</InputAdornment>,
                      endAdornment: isBalanceClicked && (
                        <InputAdornment position="end">
                          <Chip label="MAX" size="small" color="primary" />
                        </InputAdornment>
                      )
                    }}
                    disabled={isBalanceClicked}
                  />
                );
              }}
            />
          </FormControl>
          {error && (
            <Alert severity="warning" className={classes.alert}>
              {error}
            </Alert>
          )}
        </form>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onContinueClick} disabled={!!errors.sendAmount || !!errors.recipient} variant="contained" color="primary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
