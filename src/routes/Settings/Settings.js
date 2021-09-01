import { useState, useRef } from "react";
import { Box, makeStyles, Typography, Button, FormLabel, TextField, FormControlLabel, FormControl, Switch, FormGroup } from "@material-ui/core";
import { useSettings } from "../../context/SettingsProvider";
import { Controller, useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import Autocomplete from "@material-ui/lab/Autocomplete";

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
  formValue: {
    flexGrow: 1
  },
  submitButton: {
    marginLeft: "1rem"
  },
  switch: {
    width: "fit-content"
  }
}));

export function Settings(props) {
  const [isEditing, setIsEditing] = useState(false);
  const classes = useStyles();
  const { settings, setSettings } = useSettings();
  const { handleSubmit, control, reset } = useForm();
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
            <FormControl>
              <Autocomplete
                disableClearable
                options={nodes}
                style={{ width: 300 }}
                value={settings.selectedNodeKey}
                defaultValue={settings.selectedNodeKey}
                getOptionSelected={(option, value) => option === value}
                onChange={onNodeChange}
                renderInput={(params) => <TextField {...params} label="Node" variant="outlined" />}
                disabled={settings.isCustomNode}
              />
            </FormControl>
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
              <Controller
                control={control}
                name="apiEndpoint"
                rules={{ required: true }}
                defaultValue={settings.apiEndpoint}
                render={({ fieldState, field }) => (
                  <TextField
                    {...field}
                    type="text"
                    variant="outlined"
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && "Api Endpoint is required."}
                    className={classes.formValue}
                  />
                )}
              />
            ) : (
              <Typography variant="body1" className={classes.formValue}>
                {settings.apiEndpoint}
              </Typography>
            )}
          </div>

          <div className={classes.fieldRow}>
            <FormLabel className={classes.formLabel}>Rpc Endpoint:</FormLabel>

            {isEditing ? (
              <Controller
                control={control}
                name="rpcEndpoint"
                rules={{ required: true }}
                defaultValue={settings.rpcEndpoint}
                render={({ fieldState, field }) => (
                  <TextField
                    {...field}
                    type="text"
                    variant="outlined"
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && "Rpc Endpoint is required."}
                    className={classes.formValue}
                  />
                )}
              />
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
                <Button variant="contained" onClick={() => setIsEditing(false)}>
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
