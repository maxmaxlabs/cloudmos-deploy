import { useState, useEffect, forwardRef, useCallback, useRef } from "react";
import { Box, makeStyles, Button, Typography, CircularProgress, CardContent, Card, CardActions, IconButton } from "@material-ui/core";
import { SnackbarContent, useSnackbar } from "notistack";
import CloseIcon from "@material-ui/icons/Close";

const ipcApi = window.electron.api;

const useStyles = makeStyles((theme) => ({
  root: {},
  card: {
    backgroundColor: theme.palette.info.main,
    width: "100%"
  },
  typography: {
    fontWeight: "bold",
    color: theme.palette.primary.contrastText
  },
  actionRoot: {
    padding: "8px 8px 8px 16px",
    justifyContent: "space-between"
  },
  icons: {
    marginLeft: "auto"
  },
  actionButton: {
    color: theme.palette.primary.contrastText
  }
}));

export const AutoUpdater = () => {
  const classes = useStyles();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const newUpdateSnackbarKey = useRef(null);
  const downloadSnackbarKey = useRef(null);
  // const [newUpdateSnackbarKey, setNewUpdateSnackbarKey] = useState(null);
  // const [downloadSnackbarKey, setDownloadSnackbarKey] = useState(null);

  useEffect(() => {
    ipcApi.receive("update_available", (event) => {
      ipcApi.removeAllListeners("update_available");

      console.log("Update available", event);

      showNewUpdateSnackbar(event.releaseNotes, event.releaseName, event.releaseDate);
    });
    ipcApi.receive("update_downloaded", (event) => {
      ipcApi.removeAllListeners("update_downloaded");

      console.log("Update downloaded:", event);

      showUpdateDownloadedSnackbar(event.releaseNotes, event.releaseName, event.releaseDate);
    });

    ipcApi.send("check_update");
  }, []);

  /**
   * 1.
   * Show snackbar when there's a new update to download
   */
  const showNewUpdateSnackbar = (releaseNotes, releaseName, releaseDate) => {
    const key = enqueueSnackbar(
      <div>
        <Box marginBottom=".5rem">
          <strong>A new update {releaseName} is available!</strong> Downloading now...
        </Box>
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            ipcApi.send("download_update");
            closeSnackbar(key);

            newUpdateSnackbarKey.current = null;
            // setNewUpdateSnackbarKey(null);
            showDownloadingUpdateSnackbar();
          }}
        >
          Download
        </Button>
      </div>,
      {
        variant: "info",
        autoHideDuration: null
      }
    );

    newUpdateSnackbarKey.current = key;
    // setNewUpdateSnackbarKey(key);
  };

  /**
   * 2.
   * Show snackbar when downloading the update
   */
  const showDownloadingUpdateSnackbar = () => {
    const key = enqueueSnackbar("Downloading new update...", {
      variant: "info",
      content: (key, message) => <DownloadingUpdate id={key} message={message} />,
      autoHideDuration: null // Wait for download to finish
    });

    downloadSnackbarKey.current = key;
    // setDownloadSnackbarKey(key);
  };

  /**
   * 3.
   * Show snackbar when the update is downloaded
   */
  const showUpdateDownloadedSnackbar = (releaseNotes, releaseName, releaseDate) => {
    console.log("Release info", releaseNotes, releaseName, releaseDate);

    closeSnackbar(downloadSnackbarKey.current);
    downloadSnackbarKey.current = null;
    newUpdateSnackbarKey.current = null;
    // setDownloadSnackbarKey(null);
    // setNewUpdateSnackbarKey(null);

    enqueueSnackbar(
      <div>
        <Box marginBottom=".5rem">
          <strong>Update {releaseName} Downloaded!</strong> It will be installed on restart.
          <br />
          <a href="#" onClick={() => window.electron.openUrl("https://github.com/Akashlytics/akashlytics-deploy/releases")}>
            View release notes
          </a>
          <Typography variant="h6">Restart now?</Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            ipcApi.send("restart_app");
          }}
        >
          Restart App
        </Button>
      </div>,
      {
        variant: "info",
        autoHideDuration: 5 * 60 * 1000 // 5 minutes
      }
    );
  };

  return null;
  // return (
  //   <>
  //     <Button onClick={showNewUpdateSnackbar}>Update available</Button>
  //     <Button onClick={showUpdateDownloadedSnackbar}>Update downloaded</Button>
  //     <Button onClick={showDownloadingUpdateSnackbar}>Downloading Update</Button>
  //     <Button
  //       onClick={() => {
  //         closeSnackbar(downloadSnackbarKey);
  //         downloadSnackbarKey.current = null;
  //         // setDownloadSnackbarKey(null);
  //       }}
  //     >
  //       Close snackbar
  //     </Button>
  //   </>
  // );
};

const DownloadingUpdate = forwardRef(({ message, id }, ref) => {
  const { closeSnackbar } = useSnackbar();
  const classes = useStyles();

  const handleDismiss = useCallback(() => {
    closeSnackbar(id);
  }, [id, closeSnackbar]);

  return (
    <SnackbarContent ref={ref} className={classes.root}>
      <Card className={classes.card}>
        <CardActions classes={{ root: classes.actionRoot }}>
          <Typography variant="subtitle2" className={classes.typography}>
            {message}
          </Typography>

          <div className={classes.icons}>
            <IconButton onClick={handleDismiss} className={classes.actionButton} size="small">
              <CloseIcon />
            </IconButton>
          </div>
        </CardActions>
        <CardContent className={classes.actionRoot}>
          <CircularProgress size="2rem" color="secondary" />
        </CardContent>
      </Card>
    </SnackbarContent>
  );
});
