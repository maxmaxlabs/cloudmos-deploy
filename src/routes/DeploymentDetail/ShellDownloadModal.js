import { useState, useRef } from "react";
import { makeStyles, Dialog, DialogContent, DialogActions, Button, CircularProgress, TextField, FormControl, DialogTitle, Typography } from "@material-ui/core";
import { useAsyncTask } from "../../context/AsyncTaskProvider";
import { useForm, Controller } from "react-hook-form";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    paddingBottom: 0
  },
  dialogActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  formControl: {
    marginBottom: "1rem"
  },
  alert: {
    marginBottom: "1rem"
  }
}));

// const osList = [
//   { id: "linux", title: "Linux" },
//   { id: "macos", title: "MacOS" },
//   { id: "windows", title: "Windows" }
// ];

export const ShellDownloadModal = ({ selectedLease, localCert, onCloseClick, selectedService, providerInfo, setIsDownloadingFile, isDownloadingFile }) => {
  const [selectedOs] = useState("linux");
  const formRef = useRef();
  const classes = useStyles();
  const { launchAsyncTask } = useAsyncTask();
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      filePath: ""
    }
  });

  const onSubmit = async ({ filePath }) => {
    setIsDownloadingFile(true);

    await launchAsyncTask(
      async () => {
        const printCommand = getPrintCommand(selectedOs);
        const command = `${printCommand} ${filePath}`;
        const url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/shell?stdin=0&tty=0&podIndex=0${command
          .split(" ")
          .map((c, i) => `&cmd${i}=${encodeURIComponent(c.replace(" ", "+"))}`)
          .join("")}${`&service=${selectedService}`}`;
        const fileName = filePath.split("\\").pop().split("/").pop();

        const appPath = await window.electron.appPath("temp");
        const tempFilePath = await window.electron.downloadFile(appPath, url, localCert.certPem, localCert.keyPem, fileName);

        const downloadsPath = await window.electron.appPath("downloads");
        const savePath = `${downloadsPath}/${fileName}`;

        await window.electron.saveFileFromTemp(tempFilePath, savePath, {
          dialogTitle: "Save file",
          buttonLabel: "Save",
          filters: [{ name: "*", extensions: ["*"] }],
          properties: []
        });
      },
      () => {
        // Cancelled
        // TODO
        window.electron.cancelDownloadFile();
        setIsDownloadingFile(false);
      },
      "Downloading file..."
    );

    setIsDownloadingFile(false);
  };

  const onDownloadClick = (event) => {
    event.preventDefault();
    formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  // const handleOsChange = (event) => {
  //   setSelectedOs(event.target.value);
  // };

  return (
    <Dialog open={true} maxWidth="xs" fullWidth onClose={onCloseClick}>
      <DialogTitle className={classes.dialogTitle}>Download file</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Alert severity="info" className={classes.alert}>
          <Typography variant="caption">Enter the path of a file on the server to be downloaded. Example: public/index.html</Typography>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} ref={formRef} className={classes.commandForm}>
          {/* <FormControl className={classes.formControl}>
            <InputLabel id="os-label">Os</InputLabel>
            <Select labelId="os-label" id="os-select" value={selectedOs} onChange={handleOsChange}>
              {osList.map((os) => (
                <MenuItem key={os.id} value={os.id}>
                  {os.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}

          <FormControl fullWidth>
            <Controller
              control={control}
              name="filePath"
              rules={{
                required: true
              }}
              render={({ field, fieldState }) => {
                return (
                  <TextField
                    {...field}
                    type="text"
                    label="File path"
                    error={!!fieldState.invalid}
                    helperText={fieldState.invalid && "File path is required."}
                    variant="outlined"
                    autoFocus
                    placeholder="Type a valid file path"
                    fullWidth
                  />
                );
              }}
            />
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={onCloseClick}>Cancel</Button>
        <Button variant="contained" onClick={onDownloadClick} type="button" color="primary" disabled={isDownloadingFile || !!errors.filePath}>
          {isDownloadingFile ? <CircularProgress size="1.5rem" color="primary" /> : "Download"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const getPrintCommand = (os) => {
  switch (os) {
    case "linux":
    case "macos":
      return "cat";

    case "windows":
      return "type";

    default:
      return "cat";
  }
};
