import { useState, useRef, useEffect } from "react";
import {
  makeStyles,
  Button,
  Dialog,
  Checkbox,
  FormControlLabel,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputAdornment,
  Box,
  TextField,
  CircularProgress
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useWallet } from "../../context/WalletProvider";
import { aktToUakt, coinToUAkt, uaktToAKT } from "../../shared/utils/priceUtils";
import { useForm, Controller } from "react-hook-form";
import { LinkTo } from "../../shared/components/LinkTo";
import { useSettings } from "../../context/SettingsProvider";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import compareAsc from "date-fns/compareAsc";
import { analytics } from "../../shared/utils/analyticsUtils";
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

export function DeploymentDepositModal({ handleCancel, onDeploymentDeposit, min = 0, infoText = null }) {
  const classes = useStyles();
  const formRef = useRef();
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState("");
  const [isCheckingDepositor, setIsCheckingDepositor] = useState(false);
  const { balance, address } = useWallet();
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    unregister
  } = useForm({
    defaultValues: {
      amount: min,
      useDepositor: false,
      depositorAddress: ""
    }
  });
  const { amount, useDepositor, depositorAddress } = watch();

  useEffect(() => {
    clearErrors();
    setError("");

    if (!useDepositor) {
      setValue("depositorAddress", "");
      unregister("depositorAddress");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDepositor]);

  async function checkDepositor(depositAmount) {
    setIsCheckingDepositor(true);

    try {
      const response = await fetch(`${settings.apiEndpoint}/cosmos/authz/v1beta1/grants?granter=${depositorAddress}&grantee=${address}`);
      const data = await response.json();

      const grant = data.grants?.find((x) => x.authorization["@type"] === "/akash.deployment.v1beta2.DepositDeploymentAuthorization");

      if (!grant) {
        setError("You are not authorized by this depositor.");
        return false;
      }

      const expirationDate = new Date(grant.expiration);
      const expired = compareAsc(new Date(), expirationDate) === 1;

      if (expired) {
        setError(`Authorization expired since ${expirationDate.toDateString()}`);
        return false;
      }

      let spendLimitUAkt = coinToUAkt(grant.authorization.spend_limit);

      if (depositAmount > spendLimitUAkt) {
        setError(`Spend limit remaining: ${uaktToAKT(spendLimitUAkt)}akt`);
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      enqueueSnackbar(<Snackbar title={err.message} iconVariant="error" />, { variant: "error" });
      return false;
    } finally {
      setIsCheckingDepositor(false);
    }
  }

  const onClose = () => {
    handleCancel();
  };

  const onBalanceClick = () => {
    clearErrors();
    setValue("amount", uaktToAKT(balance - txFeeBuffer, 6));
  };

  const onDepositClick = (event) => {
    event.preventDefault();
    formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  const onSubmit = async ({ amount }) => {
    setError("");
    clearErrors();
    const deposit = aktToUakt(amount);

    if (deposit < aktToUakt(min)) {
      setError(`Deposit amount must be greater or equal than ${min}.`);
      return;
    }

    if (useDepositor) {
      const validDepositor = await checkDepositor(deposit);
      if (!validDepositor) {
        return;
      }

      await analytics.event("deploy", "use depositor");
    } else if (deposit > balance) {
      setError(`You can't deposit more than you currently have in your balance. Current balance is: ${uaktToAKT(balance)}AKT.`);
      return;
    }

    onDeploymentDeposit(deposit, depositorAddress);
  };

  return (
    <Dialog maxWidth="xs" fullWidth aria-labelledby="deposit-deployment-dialog-title" open={true} onClose={onClose}>
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
                required: true
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
                    inputProps={{ min: min, step: 0.000001, max: uaktToAKT(balance - txFeeBuffer, 6) }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">AKT</InputAdornment>
                    }}
                  />
                );
              }}
            />
          </FormControl>

          <FormControl className={classes.formControl} fullWidth>
            <Controller
              control={control}
              name="useDepositor"
              render={({ fieldState, field }) => {
                return <FormControlLabel control={<Checkbox {...field} color="primary" />} label="Use depositor" />;
              }}
            />
          </FormControl>

          {useDepositor && (
            <FormControl className={classes.formControl} fullWidth>
              <Controller
                control={control}
                name="depositorAddress"
                defaultValue=""
                rules={{
                  required: true
                }}
                render={({ fieldState, field }) => {
                  return (
                    <TextField
                      {...field}
                      type="text"
                      variant="outlined"
                      label="Depositor address"
                      autoFocus
                      error={!!fieldState.invalid}
                      helperText={fieldState.invalid && "Depositor address is required."}
                      className={classes.formValue}
                    />
                  );
                }}
              />
            </FormControl>
          )}

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
        <Button onClick={onDepositClick} disabled={!amount || isCheckingDepositor} variant="contained" color="primary">
          {isCheckingDepositor ? <CircularProgress size="24px" color="primary" /> : "Deposit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
