import { useRef, useState } from "react";
import { aktToUakt, uaktToAKT } from "../../shared/utils/priceUtils";
import { Address } from "../../shared/components/Address";
import { Snackbar } from "../../shared/components/Snackbar";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import Alert from "@material-ui/lab/Alert";
import {
  makeStyles,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
  Box
} from "@material-ui/core";
import { LinkTo } from "../../shared/components/LinkTo";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { useTransactionModal } from "../../context/TransactionModal";
import { addYears, format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    textAlign: "center",
    padding: "1rem"
  },
  formControl: {
    marginTop: 10
  }
}));

export const GrantModal = ({ address, onClose }) => {
  const formRef = useRef();
  const [error, setError] = useState("");

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { sendTransaction } = useTransactionModal();
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
      amount: "",
      expiration: format(addYears(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
      useDepositor: false,
      granteeAddress: ""
    }
  });
  const { amount, granteeAddress, expiration } = watch();

  const onDepositClick = (event) => {
    event.preventDefault();
    formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  const onSubmit = async ({ amount }) => {
    setError("");
    clearErrors();
    const spendLimit = aktToUakt(amount);

    const expirationDate = new Date(expiration);
    const message = TransactionMessageData.getGrantMsg(address, granteeAddress, spendLimit, expirationDate);
    const response = await sendTransaction([message]);

    if (response) {
      onClose();
    }
  };

  function handleDocClick(ev, url) {
    ev.preventDefault();

    window.electron.openUrl(url);
  }

  return (
    <Dialog maxWidth="xs" aria-labelledby="deposit-dialog-title" open={true} onClose={onClose}>
      <DialogTitle id="deposit-dialog-title">Authorize Spending</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          <Alert severity="info" className={classes.alert}>
            <Typography variant="caption">
              <LinkTo onClick={(ev) => handleDocClick(ev, "https://docs.akash.network/testnet-technical-docs/authorized-spend")}>Authorized Spend</LinkTo>{" "}
              allows users to authorize spend of a set number of tokens from a source wallet to a destination, funded wallet. The authorized spend is restricted
              to Akash deployment activities and the recipient of the tokens would not have access to those tokens for other operations.
            </Typography>
          </Alert>

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
                    label="Spending Limit"
                    autoFocus
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && helperText}
                    className={classes.formValue}
                    inputProps={{ min: 0, step: 0.000001 }}
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
              name="granteeAddress"
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
                    label="Grantee Address"
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && "Grantee address is required."}
                    className={classes.formValue}
                  />
                );
              }}
            />
          </FormControl>

          <FormControl className={classes.formControl} fullWidth>
            <Controller
              control={control}
              name="expiration"
              rules={{
                required: true
              }}
              render={({ fieldState, field }) => {
                return (
                  <TextField
                    {...field}
                    type="datetime-local"
                    variant="outlined"
                    label="Expiration"
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && "Expiration is required."}
                    className={classes.formValue}
                  />
                );
              }}
            />
          </FormControl>

          {!!amount && granteeAddress && (
            <Box marginTop={1} textAlign={"left"}>
              This address will be able to spend up to {amount}AKT on your behalf.
            </Box>
          )}

          {error && (
            <Alert severity="warning" className={classes.alert}>
              {error}
            </Alert>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onDepositClick} disabled={!amount} variant="contained" color="primary">
          Grant
        </Button>
      </DialogActions>
    </Dialog>
  );
};
