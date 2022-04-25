import { useEffect, useRef } from "react";
import { Box, makeStyles, Button } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { LinkTo } from "../../shared/components/LinkTo";
import { Snackbar } from "../../shared/components/Snackbar";

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
  },
  white: {
    color: theme.palette.common.white
  }
}));

export const AutoUpdater = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const newUpdateSnackbarKey = useRef(null);
  const downloadSnackbarKey = useRef(null);
  const intervalUpdateCheck = useRef(null);
  const classes = useStyles();

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

    // Check for udpates every 30 seconds
    intervalUpdateCheck.current = setInterval(() => {
      ipcApi.send("check_update");
    }, 60000);

    return () => {
      clearInterval(intervalUpdateCheck.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 1.
   * Show snackbar when there's a new update to download
   */
  const showNewUpdateSnackbar = (releaseNotes, releaseName, releaseDate) => {
    // Cancel the interval
    clearInterval(intervalUpdateCheck.current);

    const key = enqueueSnackbar(
      <Snackbar
        title="Update available!"
        iconVariant="success"
        subTitle={
          <div>
            <Box marginBottom={1}>
              A new update {releaseName} is available! Download now?{" "}
              <LinkTo className={classes.white} onClick={() => window.electron.openUrl("https://github.com/Akashlytics/akashlytics-deploy/releases")}>
                View release notes
              </LinkTo>
            </Box>

            <Button
              size="small"
              variant="contained"
              onClick={() => {
                ipcApi.send("download_update");
                closeSnackbar(key);

                newUpdateSnackbarKey.current = null;
                showDownloadingUpdateSnackbar();
              }}
            >
              Download
            </Button>
          </div>
        }
      />,
      {
        variant: "info",
        autoHideDuration: null
      }
    );

    newUpdateSnackbarKey.current = key;
  };

  /**
   * 2.
   * Show snackbar when downloading the update
   */
  const showDownloadingUpdateSnackbar = () => {
    const key = enqueueSnackbar(<Snackbar title="Downloading update..." showLoading />, {
      variant: "info",
      autoHideDuration: null // Wait for download to finish
    });

    downloadSnackbarKey.current = key;
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

    enqueueSnackbar(
      <Snackbar
        title="Restart now?"
        subTitle={
          <div>
            <Box marginBottom=".5rem">
              Update {releaseName} Downloaded! It will be installed on restart.{" "}
              <LinkTo className={classes.white} onClick={() => window.electron.openUrl("https://github.com/Akashlytics/akashlytics-deploy/releases")}>
                View release notes
              </LinkTo>
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
          </div>
        }
        iconVariant="info"
      />,
      {
        variant: "info",
        autoHideDuration: 5 * 60 * 1000 // 5 minutes
      }
    );
  };

  return null;
  // return (
  //   <Box position="absolute" top="40px">
  //     <Button onClick={showNewUpdateSnackbar}>Update available</Button>
  //     <Button onClick={showUpdateDownloadedSnackbar}>Update downloaded</Button>
  //     <Button onClick={showDownloadingUpdateSnackbar}>Downloading Update</Button>
  //     <Button
  //       onClick={() => {
  //         closeSnackbar(downloadSnackbarKey.current);
  //         downloadSnackbarKey.current = null;
  //       }}
  //     >
  //       Close snackbar
  //     </Button>
  //   </Box>
  // );
};
