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
  CircularProgress,
  ClickAwayListener
} from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { useSettings } from "../../context/SettingsProvider";
import { Controller, useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { isUrl } from "../../shared/utils/stringUtils";
import { NodeStatus } from "../../shared/components/NodeStatus";
import clsx from "clsx";

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
  },
  inputClickable: {
    cursor: "pointer"
  }
}));

export function Settings(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isNodesOpen, setIsNodesOpen] = useState(false);
  const classes = useStyles();
  const { settings, setSettings, refreshNodeStatuses, isRefreshingNodeStatus } = useSettings();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm();
  const formRef = useRef();
  const { selectedNode, nodes } = settings;

  const onIsCustomNodeChange = (event) => {
    const isChecked = event.target.checked;
    const apiEndpoint = isChecked ? settings.apiEndpoint : selectedNode.api;
    const rpcEndpoint = isChecked ? settings.rpcEndpoint : selectedNode.rpc;

    reset();

    setSettings({ ...settings, isCustomNode: isChecked, apiEndpoint, rpcEndpoint });

    refreshNodeStatuses();
  };

  const onNodeChange = (event, newNodeId) => {
    const newNode = nodes.find((n) => n.id === newNodeId);
    const apiEndpoint = newNode.api;
    const rpcEndpoint = newNode.rpc;

    setSettings({ ...settings, apiEndpoint, rpcEndpoint, selectedNode: newNode });
  };

  const onRefreshNodeStatus = async () => {
    await refreshNodeStatuses();
  };

  /**
   *  Update the custom settings
   * @param {Object} data {apiEndpoint: string, rpcEndpoint: string}
   */
  const onSubmit = (data) => {
    setSettings({ ...settings, ...data });
    setIsEditing(false);

    refreshNodeStatuses();
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
                  open={isNodesOpen}
                  options={nodes.map((n) => n.id)}
                  style={{ width: 300 }}
                  value={settings.selectedNode.id}
                  defaultValue={settings.selectedNode.id}
                  getOptionSelected={(option, value) => option === value}
                  onChange={onNodeChange}
                  renderInput={(params) => (
                    <ClickAwayListener onClickAway={() => setIsNodesOpen(false)}>
                      <TextField
                        {...params}
                        label="Node"
                        variant="outlined"
                        onClick={() => setIsNodesOpen((prev) => !prev)}
                        InputProps={{
                          ...params.InputProps,
                          classes: { root: clsx(classes.nodeInput, classes.inputClickable), input: classes.inputClickable },
                          endAdornment: (
                            <InputAdornment position="end">
                              <Box marginRight=".5rem" display="inline-flex">
                                <KeyboardArrowDownIcon fontSize="small" />
                              </Box>
                              <NodeStatus latency={Math.floor(selectedNode.latency)} status={selectedNode.status} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </ClickAwayListener>
                  )}
                  renderOption={(option) => {
                    const node = nodes.find((n) => n.id === option);
                    return (
                      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <div>{option}</div>
                        <NodeStatus latency={Math.floor(node.latency)} status={node.status} />
                      </Box>
                    );
                  }}
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
            control={<Switch checked={!!settings.isCustomNode} onChange={onIsCustomNodeChange} color="primary" />}
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
