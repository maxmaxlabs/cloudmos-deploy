import { useEffect, useState, useRef } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  Box,
  makeStyles,
  Typography
} from "@material-ui/core";
import { openWallet } from "../../shared/utils/walletUtils";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import { useForm, Controller } from "react-hook-form";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: "1rem"
  },
  dialogActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  alertRoot: {
    borderColor: theme.palette.primary.main
  },
  alertMessage: {
    display: "flex",
    alignItems: "center"
  }
}));

export function ConfirmPasswordModal(props) {
  const classes = useStyles();
  const formRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
    reset
  } = useForm({
    defaultValues: {
      password: ""
    }
  });

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isOpen]);

  const onConfirmClick = (event) => {
    event.preventDefault();
    formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  async function onSubmit({ password }) {
    clearErrors();

    try {
      setIsLoading(true);

      await openWallet(password);

      props.onConfirmPassword(password);
    } catch (err) {
      if (err.message === "ciphertext cannot be decrypted using that key") {
        enqueueSnackbar(<Snackbar title="Invalid password" />, { variant: "error" });
      } else {
        console.error(err);
        enqueueSnackbar(<Snackbar title="Error while decrypting wallet" />, { variant: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={props.isOpen} onClose={props.onClose}>
      <DialogTitle>Confirm your password</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <Box marginBottom="1rem">
          <Alert
            icon={<LockOpenIcon fontSize="large" color="primary" />}
            variant="outlined"
            classes={{ root: classes.alertRoot, message: classes.alertMessage }}
          >
            <Typography variant="caption">Please input your password to proceed.</Typography>
          </Alert>
        </Box>
        <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          <FormControl error={!errors.password} fullWidth>
            <Controller
              control={control}
              name="password"
              rules={{
                required: true
              }}
              render={({ fieldState, field }) => {
                const helperText = "Password is required.";

                return (
                  <TextField
                    {...field}
                    autoFocus
                    type="password"
                    variant="outlined"
                    label="Password"
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && helperText}
                  />
                );
              }}
            />
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button disabled={isLoading} onClick={props.onClose} type="button">
          Cancel
        </Button>
        <Button disabled={isLoading} variant="contained" color="primary" onClick={onConfirmClick}>
          {isLoading ? <CircularProgress size="24px" color="primary" /> : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
