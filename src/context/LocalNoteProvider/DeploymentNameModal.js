import React, { useEffect, useState } from "react";
import { updateDeploymentLocalData } from "../../shared/utils/deploymentLocalDataUtils";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@material-ui/core";

export const DeploymentNameModal = ({ dseq, onClose, onSaved, getDeploymentName }) => {
  const [currentName, setCurrentName] = useState("");

  useEffect(() => {
    if (dseq) {
      const name = getDeploymentName(dseq);
      setCurrentName(name || "");
    }
  }, [dseq]);

  function handleSubmit(ev) {
    ev.preventDefault();

    updateDeploymentLocalData(dseq, { name: currentName });

    onSaved();
  }

  return (
    <Dialog open={!!dseq} onClose={onClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
      <DialogTitle id="simple-dialog-title">Change Deployment Name ({dseq})</DialogTitle>
      <DialogContent dividers>
        <div>
          <form onSubmit={handleSubmit}>
            <TextField label="Name" fullWidth value={currentName} onChange={(ev) => setCurrentName(ev.target.value)} type="text" variant="outlined" autoFocus />
          </form>
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
