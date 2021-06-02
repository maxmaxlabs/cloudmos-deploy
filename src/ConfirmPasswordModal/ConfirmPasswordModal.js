import { useEffect, useState } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { openWallet } from '../walletHelper';

export function ConfirmPasswordModal(props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPassword("");
  }, [props.isOpen]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");

    try {
      await openWallet(password);

      props.onConfirmPassword(password);
    } catch (err) {
      console.error(err);
      setError("Invalid password");
    }
  }

  return (
    <Dialog
      open={props.isOpen}
      onClose={props.onClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <DialogTitle id="simple-dialog-title">Confirm your password</DialogTitle>
      <DialogContent dividers>
        <div>
          <form onSubmit={handleSubmit}>

            <TextField
              label="Password"
              value={password}
              onChange={ev => setPassword(ev.target.value)}
              type="password"
              variant="outlined"
              autoFocus
            />
            {error && <Alert severity="warning">{error}</Alert>}
          </form>
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={props.onClose} type="button">Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>Confirm</Button>
      </DialogActions>
    </Dialog>
  )
}