import { useEffect, useState } from "react";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { openWallet } from "../../shared/utils/walletUtils";
import { useSnackbar } from "notistack";

export function ConfirmPasswordModal(props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setPassword("");
  }, [props.isOpen]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await openWallet(password);

      props.onConfirmPassword(password);
    } catch (err) {
      if (err.message === "ciphertext cannot be decrypted using that key") {
        enqueueSnackbar("Invalid password", { variant: "error" });
      } else {
        console.error(err);
        enqueueSnackbar("Error while decrypting wallet", { variant: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={props.isOpen} onClose={props.onClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
      <DialogTitle id="simple-dialog-title">Confirm your password</DialogTitle>
      <DialogContent dividers>
        <div>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Password"
              disabled={isLoading}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              type="password"
              variant="outlined"
              autoFocus
            />
            {error && <Alert severity="warning">{error}</Alert>}
          </form>
        </div>
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading} variant="contained" onClick={props.onClose} type="button">
          Cancel
        </Button>
        <Button disabled={isLoading} variant="contained" color="primary" onClick={handleSubmit}>
          {isLoading ? <CircularProgress size="24px" color="primary" /> : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
