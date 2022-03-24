import { Button, makeStyles, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl } from "@material-ui/core";
import { useWallet } from "../../context/WalletProvider";
import { useForm, Controller } from "react-hook-form";
import { useRef } from "react";
import { updateLocalStorageWalletName } from "../../shared/utils/walletUtils";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import { analytics } from "../../shared/utils/analyticsUtils";

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: "1rem"
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

export function ChangeAccountNameModal(props) {
  const formRef = useRef();
  const { selectedWallet, setSelectedWallet, address } = useWallet();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const {
    handleSubmit,
    control,
    formState: { errors },
    clearErrors
  } = useForm({
    defaultValues: {
      name: ""
    }
  });

  const onSaveClick = (event) => {
    event.preventDefault();
    formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  async function onSubmit({ name }) {
    clearErrors();
    try {
      updateLocalStorageWalletName(address, name);
      selectedWallet.name = name;

      setSelectedWallet(selectedWallet);

      enqueueSnackbar(<Snackbar title="Success!" />, { variant: "success", autoHideDuration: 2000 });

      await analytics.event("deploy", "change account name");

      props.onClose();
    } catch (err) {
      console.error(err);
      enqueueSnackbar(<Snackbar title={err.message} />, { variant: "error" });
    }
  }

  return (
    <Dialog open={true} onClose={props.onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Account Name</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <FormControl className={classes.formControl} fullWidth>
          <TextField variant="outlined" disabled value={selectedWallet?.name} label="Current Account Name" />
        </FormControl>

        <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          <FormControl error={!errors.name} fullWidth>
            <Controller
              control={control}
              name="name"
              rules={{
                required: true
              }}
              render={({ fieldState, field }) => {
                const helperText = "Account name is required.";

                return (
                  <TextField
                    {...field}
                    autoFocus
                    type="text"
                    variant="outlined"
                    label="New Account Name"
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
        <Button onClick={props.onClose}>Close</Button>
        <Button variant="contained" color="primary" onClick={onSaveClick}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
