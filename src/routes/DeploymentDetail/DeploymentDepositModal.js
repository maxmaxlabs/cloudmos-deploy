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
  const [depositAmount, setDepositAmount] = useState(min);
  const [error, setError] = useState("");
  const { balance } = useWallet();

  const onClose = () => {
    setDepositAmount(min);
    handleCancel();
  };

  const handleSubmit = () => {
    setError("");
    const deposit = aktToUakt(depositAmount);

    if (depositAmount < min) {
      setError(`Deposit amount must be greater or equal than ${min}.`);
      return;
    }

    if (deposit > balance) {
      setError(`You can't deposit more than you currently have in your balance. Current balance is: ${uaktToAKT(balance)}AKT.`);
      return;
    }

    onDeploymentDeposit(deposit);
  };

  return (
    <Dialog maxWidth="xs" fullWidth aria-labelledby="deposit-deployment-dialog-title" open={isDepositingDeployment} onClose={onClose}>
      <DialogTitle id="deposit-deployment-dialog-title">Deployment Deposit</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <form onSubmit={handleSubmit}>
          {infoText}

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
              inputProps={{ min: min }}
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
      <DialogActions className={classes.dialogActions}>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!depositAmount || !!error} variant="contained" color="primary">
          Deposit
        </Button>
      </DialogActions>
    </Dialog>
  );
}