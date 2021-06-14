import { useState, useRef } from "react";
import { Box, makeStyles, Typography, Button, FormLabel, TextField } from "@material-ui/core";
import { useSettings } from "../../context/SettingsProvider";
import { Controller, useForm } from "react-hook-form";

const useStyles = makeStyles((theme) => ({
  root: { padding: "1rem" },
  title: {
    fontSize: "2rem",
    fontWeight: "bold"
  },
  form: {
    padding: "2rem 1rem"
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
  }
}));

export function Settings(props) {
  const [isEditing, setIsEditing] = useState(false);
  const classes = useStyles();
  const { settings, setSettings } = useSettings();
  const { handleSubmit, control } = useForm();
  const formRef = useRef();

  const onSubmit = (data) => {
    setSettings(data);
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.titleContainer}>
        <Typography variant="h3" className={classes.title}>
          Settings
        </Typography>
      </Box>

      <form
        className={classes.form}
        onSubmit={handleSubmit((data) => {
          debugger;
          onSubmit(data);
        })}
        ref={formRef}
      >
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

        <Box paddingTop="2rem">
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
    </Box>
  );
}
