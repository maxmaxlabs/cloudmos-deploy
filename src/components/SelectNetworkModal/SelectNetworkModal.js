import { useState } from "react";
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
import { useSettings } from "../../context/SettingsProvider";
import { Alert } from "@material-ui/lab";

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
  }
}));

export const SelectNetworkModal = ({ onClose }) => {
  const classes = useStyles();
  const { settings, setSettings } = useSettings();
  const { selectedNetworkId } = settings;
  const [localSelectedNetworkId, setLocalSelectedNetworkId] = useState(selectedNetworkId);

  const handleSelectNetwork = (network) => {
    setLocalSelectedNetworkId(network.id);
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
                      {(network.title === "Testnet" || network.title === "Edgenet") && (
                        <Chip label="Experimental" size="small" color="secondary" className={classes.experimentalChip} />
                      )}
                    </Box>
                  }
                  secondary={network.description}
                />
              </ListItem>
            );
          })}
        </List>

        <Alert variant="outlined" severity="warning">
          <Typography variant="body1">
            <strong>Warning</strong>
          </Typography>

          <Typography variant="body2">Changing networks will restart the ui and is still experimental.</Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} type="button" autoFocus>
          Close
        </Button>
        <Button variant="contained" onClick={onClose} color="primary" type="button">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
