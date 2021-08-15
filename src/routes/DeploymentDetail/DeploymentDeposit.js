import { useState } from "react";
import {
  makeStyles,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useWallet } from "../../context/WalletProvider";
import { aktToUakt, uaktToAKT } from "../../shared/utils/priceUtils";

const useStyles = makeStyles((theme) => ({
  root: {},
  alert: {
    marginTop: "1rem"
  }
}));

export function DeploymentDeposit({ isDepositingDeployment, handleCancel, onDeploymentDeposit }) {
  const classes = useStyles();
  const [depositAmount, setDepositAmount] = useState(0);
  const [error, setError] = useState("");
  const { balance } = useWallet();

  const onClose = () => {
    setDepositAmount(0);
  };

  const handleSubmit = () => {
    setError("");
    const deposit = aktToUakt(depositAmount);

    if (deposit === 0) {
      setError(`Deposit amount must be greater than 0.`);
      return;
    }

    if (deposit > balance) {
      setError(`You can't deposit more than you currently have in your balance. Current balance is: ${uaktToAKT(balance)}AKT.`);
      return;
    }

    onDeploymentDeposit(deposit);
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
      aria-labelledby="deposit-deployment-dialog-title"
      open={isDepositingDeployment}
      onExit={onClose}
    >
      <DialogTitle id="deposit-deployment-dialog-title">Deployment Deposit</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="deployment-deposit-amount">Amount</InputLabel>
            <OutlinedInput
              id="deployment-deposit-amount"
              value={depositAmount}
              onChange={(ev) => {
                setError("");
                setDepositAmount(ev.target.value);
              }}
              startAdornment={<InputAdornment position="start">AKT</InputAdornment>}
              labelWidth={60}
              type="number"
              inputProps={{ min: 0 }}
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
        <Button autoFocus onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!depositAmount || !!error} variant="contained" color="secondary">
          Deposit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
