import { useState, useRef } from "react";
import { makeStyles, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputAdornment, Box, TextField, Chip } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useWallet } from "../../context/WalletProvider";
import { aktToUakt, uaktToAKT } from "../../shared/utils/priceUtils";
import { useForm, Controller } from "react-hook-form";
import { LinkTo } from "../../shared/components/LinkTo";
import { fees } from "../../shared/utils/blockchainUtils";

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

export function DeploymentDepositModal({ isDepositingDeployment, handleCancel, onDeploymentDeposit, min = 0, infoText = null }) {
  const classes = useStyles();
  const formRef = useRef();
  const [error, setError] = useState("");
  const [isBalanceClicked, setIsBalanceClicked] = useState(false);
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
      amount: min
    }
  });
  const { amount } = watch();

  const onClose = () => {
    setValue("amount", min || 0);
    handleCancel();
  };

  const onBalanceClick = () => {
    setIsBalanceClicked((prev) => !prev);
    clearErrors();
    setValue("amount", uaktToAKT(balance - fees.high, 6));
  };

  const onDepositClick = (event) => {
    event.preventDefault();
    formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  const onSubmit = ({ amount }) => {
    clearErrors();
    const deposit = aktToUakt(amount);

    if (amount < min) {
      setError(`Deposit amount must be greater or equal than ${min}.`);
      return;
    }

    if (deposit > balance) {
      setError(`You can't deposit more than you currently have in your balance. Current balance is: ${uaktToAKT(balance)}AKT.`);
      return;
    }

    setValue("amount", 0);
    setIsBalanceClicked(false);

    onDeploymentDeposit(deposit);
  };

  return (
    <Dialog maxWidth="xs" fullWidth aria-labelledby="deposit-deployment-dialog-title" open={isDepositingDeployment} onClose={onClose}>
      <DialogTitle id="deposit-deployment-dialog-title">Deployment Deposit</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          {infoText}

          <Box marginBottom=".5rem" marginTop={infoText ? 0 : ".5rem"} textAlign="right">
            <LinkTo onClick={() => onBalanceClick()}>Balance: {uaktToAKT(balance, 6)} AKT</LinkTo>
          </Box>

          <FormControl error={!errors.amount} className={classes.formControl} fullWidth>
            <Controller
              control={control}
              name="amount"
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
                    inputProps={{ min: min, step: 0.000001, max: uaktToAKT(balance - fees.high, 6) }}
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
        <Button autoFocus onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onDepositClick} disabled={!amount || !!error || !!errors.amount} variant="contained" color="primary">
          Deposit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
