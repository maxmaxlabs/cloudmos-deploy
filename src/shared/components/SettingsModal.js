import { makeStyles, Button, Dialog, DialogContent, DialogActions, DialogTitle } from "@material-ui/core";
import { Settings } from "../../routes/Settings";

const useStyles = makeStyles((theme) => ({}));

export const SettingsModal = ({ onClose }) => {
  const classes = useStyles();

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Edit settings</DialogTitle>
      <DialogContent dividers>
        <Settings />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} type="button">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
