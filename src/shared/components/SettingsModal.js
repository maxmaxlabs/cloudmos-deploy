import { makeStyles, Button, Dialog, DialogContent, DialogActions, DialogTitle } from "@material-ui/core";
import { Settings } from "../../routes/Settings";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: "0"
  }
}));

export const SettingsModal = ({ onClose }) => {
  const classes = useStyles();

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Edit settings</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <Settings />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} type="button" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
