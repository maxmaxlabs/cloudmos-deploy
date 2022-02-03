import { useEffect, useRef } from "react";
import { updateDeploymentLocalData } from "../../shared/utils/deploymentLocalDataUtils";
import { makeStyles, FormControl, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: "1rem"
  },
  dialogActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }
}));

export const DeploymentNameModal = ({ dseq, onClose, onSaved, getDeploymentName }) => {
  const classes = useStyles();
  const formRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const { handleSubmit, control, setValue } = useForm({
    defaultValues: {
      name: ""
    }
  });

  useEffect(() => {
    if (dseq) {
      const name = getDeploymentName(dseq);
      setValue("name", name || "");
    }
  }, [dseq, getDeploymentName]);

  const onSaveClick = (event) => {
    event.preventDefault();
    formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  function onSubmit({ name }) {
    updateDeploymentLocalData(dseq, { name: name });

    enqueueSnackbar(<Snackbar title="Deployment name change success!" />, { variant: "success" });

    onSaved();
  }

  return (
    <Dialog open={!!dseq} onClose={onClose}>
      <DialogTitle>Change Deployment Name ({dseq})</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          <FormControl fullWidth>
            <Controller
              control={control}
              name="name"
              render={({ field }) => {
                return <TextField {...field} autoFocus type="text" variant="outlined" label="Name" />;
              }}
            />
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" color="primary" onClick={onSaveClick}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
