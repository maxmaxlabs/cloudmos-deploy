import { useState, useRef } from "react";
import {
  Box,
  makeStyles,
  Typography,
  Button,
  FormLabel,
  TextField,
  FormControlLabel,
  FormControl,
  Switch,
  FormGroup,
  InputAdornment,
  IconButton,
  CircularProgress
} from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useSettings } from "../../context/SettingsProvider";
import { Controller, useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { StatusPill } from "../../shared/components/StatusPill";
import { isUrl } from "../../shared/utils/stringUtils";

const useStyles = makeStyles((theme) => ({
  root: { padding: "1rem" },
  title: {
    fontSize: "2rem",
    fontWeight: "bold"
  },
  form: {
    padding: "1rem 0"
  },
  fieldRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: ".5rem"
  },
  formLabel: {
    fontWeight: "bold",
    flexBasis: "20%",
    minWidth: 150,
    paddingRight: "1rem"
  },
  formControl: {
    width: "100%"
  },
  formValue: {
    flexGrow: 1
  },
  submitButton: {
    marginLeft: "1rem"
  },
  switch: {
    width: "fit-content"
  },
  nodeInput: {
    paddingRight: "1rem !important"
  }
}));

export function Settings(props) {
  const [isEditing, setIsEditing] = useState(false);
  const classes = useStyles();
  const { settings, setSettings, refreshNodeStatuses, isRefreshingNodeStatus } = useSettings();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm();
  const formRef = useRef();
  const nodes = Object.keys(settings.nodes);

  const onIsCustomNodeChange = (event) => {
    const isChecked = event.target.checked;
    const apiEndpoint = isChecked ? settings.apiEndpoint : `http://${settings.selectedNodeKey}:${settings.nodes[settings.selectedNodeKey].api}`;
    const rpcEndpoint = isChecked ? settings.rpcEndpoint : `http://${settings.selectedNodeKey}:${settings.nodes[settings.selectedNodeKey].rpc}`;

    reset();

    setSettings({ ...settings, isCustomNode: isChecked, apiEndpoint, rpcEndpoint });
  };

  const onNodeChange = (event, newValue) => {
    const apiEndpoint = `http://${newValue}:${settings.nodes[newValue].api}`;
    const rpcEndpoint = `http://${newValue}:${settings.nodes[newValue].rpc}`;

    setSettings({ ...settings, apiEndpoint, rpcEndpoint, selectedNodeKey: newValue });
  };

  const onRefreshNodeStatus = async () => {
    await refreshNodeStatuses();
  };

  const onSubmit = (data) => {
    setSettings({ ...settings, ...data });
    setIsEditing(false);
  };

  return (
    <Box className={classes.root}>
      <Helmet title="Settings" />

      <Box className={classes.titleContainer}>
        <Typography variant="h3" className={classes.title}>
          Settings
        </Typography>
      </Box>

      <Box marginTop="1rem">
        <FormGroup>
          {!settings.isCustomNode && (
            <Box display="flex" alignItems="center">
              <FormControl>
                <Autocomplete
                  disableClearable
                  options={nodes}
                  style={{ width: 300 }}
                  value={settings.selectedNodeKey}
                  defaultValue={settings.selectedNodeKey}
                  getOptionSelected={(option, value) => option === value}
                  onChange={onNodeChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Node"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        classes: { root: classes.nodeInput },
                        endAdornment: (
                          <InputAdornment position="end">
                            <NodeStatus
                              latency={Math.floor(settings.nodes[settings.selectedNodeKey].latency)}
                              status={settings.nodes[settings.selectedNodeKey].status}
                            />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                  renderOption={(option, {}) => (
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                      <div>{option}</div>
                      <NodeStatus latency={Math.floor(settings.nodes[option].latency)} status={settings.nodes[option].status} />
                    </Box>
                  )}
                  disabled={settings.isCustomNode}
                />
              </FormControl>

              <Box marginLeft="1rem">
                <IconButton onClick={() => onRefreshNodeStatus()} aria-label="refresh" disabled={isRefreshingNodeStatus}>
                  {isRefreshingNodeStatus ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
                </IconButton>
              </Box>
            </Box>
          )}

          <FormControlLabel
            className={classes.switch}
            control={<Switch checked={settings.isCustomNode} onChange={onIsCustomNodeChange} color="primary" />}
            label="Custom node"
          />
        </FormGroup>
      </Box>

      {settings.isCustomNode && (
        <form className={classes.form} onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          <div className={classes.fieldRow}>
            <FormLabel className={classes.formLabel}>Api Endpoint:</FormLabel>

            {isEditing ? (
              <FormControl error={!errors.apiEndpoint} className={classes.formControl}>
                <Controller
                  control={control}
                  name="apiEndpoint"
                  rules={{
                    required: true,
                    validate: (v) => isUrl(v)
                  }}
                  defaultValue={settings.apiEndpoint}
                  render={({ fieldState, field }) => {
                    const helperText = fieldState.error?.type === "validate" ? "Url is invalid." : "Api endpoint is required.";

                    return (
                      <TextField
                        {...field}
                        type="text"
                        variant="outlined"
                        error={!!fieldState.invalid}
                        helperText={fieldState.invalid && helperText}
                        className={classes.formValue}
                      />
                    );
                  }}
                />
              </FormControl>
            ) : (
              <Typography variant="body1" className={classes.formValue}>
                {settings.apiEndpoint}
              </Typography>
            )}
          </div>

          <div className={classes.fieldRow}>
            <FormLabel className={classes.formLabel}>Rpc Endpoint:</FormLabel>

            {isEditing ? (
              <FormControl error={!errors.apiEndpoint} className={classes.formControl}>
                <Controller
                  control={control}
                  name="rpcEndpoint"
                  rules={{
                    required: true,
                    validate: (v) => isUrl(v)
                  }}
                  defaultValue={settings.rpcEndpoint}
                  render={({ fieldState, field }) => {
                    const helperText = fieldState.error?.type === "validate" ? "Url is invalid." : "Rpc endpoint is required.";

                    return (
                      <TextField
                        {...field}
                        type="text"
                        variant="outlined"
                        error={!!fieldState.invalid}
                        helperText={fieldState.invalid && helperText}
                        className={classes.formValue}
                      />
                    );
                  }}
                />
              </FormControl>
            ) : (
              <Typography variant="body1" className={classes.formValue}>
                {settings.rpcEndpoint}
              </Typography>
            )}
          </div>

          <Box paddingTop="1rem">
            {!isEditing && (
              <Button variant="contained" color="primary" onClick={() => setIsEditing(!isEditing)}>
                Edit
              </Button>
            )}

            {isEditing && (
              <>
                <Button
                  variant="contained"
                  onClick={() => {
                    reset(null, { keepDefaultValues: true });
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  className={classes.submitButton}
                  onClick={() => formRef.current.dispatchEvent(new Event("submit"))}
                >
                  Submit
                </Button>
              </>
            )}
          </Box>
        </form>
      )}
    </Box>
  );
}

const NodeStatus = ({ latency, status }) => {
  return (
    <Box display="flex" alignItems="center">
      <div>
        <Typography variant="caption">{latency}ms</Typography>
      </div>
      <div>
        <StatusPill state={status === "active" ? "active" : "closed"} />
      </div>
    </Box>
  );
};
