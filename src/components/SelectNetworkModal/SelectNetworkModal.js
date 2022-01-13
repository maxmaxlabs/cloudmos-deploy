import { useEffect, useState } from "react";
import {
  makeStyles,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  Radio,
  ListItemText,
  Chip,
  Typography,
  Box
} from "@material-ui/core";
import { networks } from "../../shared/networks";
import { mainnetId } from "../../shared/constants";
import { useSettings } from "../../context/SettingsProvider";
import { Alert } from "@material-ui/lab";

const ipcApi = window.electron.api;

const useStyles = makeStyles((theme) => ({
  list: {},
  dialogContent: {
    padding: "0 .5rem"
  },
  experimentalChip: {
    height: "16px",
    marginLeft: "1rem",
    fontSize: ".7rem",
    fontWeight: "bold"
  },
  version: {
    fontWeight: "bold"
  },
  alert: {
    marginBottom: "1rem"
  }
}));

export const SelectNetworkModal = ({ onClose }) => {
  const classes = useStyles();
  const { selectedNetworkId } = useSettings();
  const [localSelectedNetworkId, setLocalSelectedNetworkId] = useState(selectedNetworkId);

  const handleSelectNetwork = (network) => {
    setLocalSelectedNetworkId(network.id);
  };

  const handleSaveChanges = () => {
    // TODO
    // Set in the settings and local storage
    localStorage.setItem("selectedNetworkId", localSelectedNetworkId);
    // Reset the ui to reload the settings for the currently selected network
    ipcApi.send("relaunch");
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Network</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <List className={classes.list}>
          {networks.map((network) => {
            return (
              <ListItem key={network.id} dense button onClick={() => handleSelectNetwork(network)}>
                <ListItemIcon>
                  <Radio checked={localSelectedNetworkId === network.id} value={network.id} />
                </ListItemIcon>
                <ListItemText
                  classes={{ secondary: classes.secondaryText }}
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between" fontSize="1rem">
                      <span>
                        {network.title}
                        {" - "}
                        <Typography variant="caption" className={classes.version}>
                          {network.version}
                        </Typography>
                      </span>
                      {network.id !== mainnetId && <Chip label="Experimental" size="small" color="secondary" className={classes.experimentalChip} />}
                    </Box>
                  }
                  secondary={network.description}
                />
              </ListItem>
            );
          })}
        </List>

        {localSelectedNetworkId !== mainnetId && (
          <Alert variant="outlined" severity="warning" className={classes.alert}>
            <Typography variant="body1">
              <strong>Warning</strong>
            </Typography>

            <Typography variant="body2">Changing networks will restart the app and some features are experimental.</Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} type="button" autoFocus>
          Close
        </Button>
        <Button variant="contained" onClick={handleSaveChanges} color="primary" type="button">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Import
// Object.keys(data).forEach(key => {
//   localStorage.setItem(key, data[key])
// })
