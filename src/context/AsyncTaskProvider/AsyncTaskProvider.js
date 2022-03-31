import React from "react";
import { Button, Box, CircularProgress } from "@material-ui/core";
import { useSnackbar } from "notistack";

const AsyncTaskProviderContext = React.createContext({});

export const AsyncTaskProvider = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const launchAsyncTask = async (fn, cancel, message) => {
    const onCancel = () => {
      closeSnackbar(key);

      try {
        cancel();
      } catch (error) {
        // console.log(error);
      }
    };

    const key = enqueueSnackbar(
      <>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <Box display="flex" alignItems="center" paddingRight=".5rem">
            <CircularProgress size="1rem" />
          </Box>

          <Box flexGrow={1} paddingRight="1rem">
            {message}
          </Box>
          <div>
            <Button onClick={onCancel} variant="contained" color="primary" size="small">
              Cancel
            </Button>
          </div>
        </Box>
      </>,
      { variant: "info", persist: true, action: (key) => null }
    );

    try {
      await fn();
    } catch (error) {
      console.log(error);
    } finally {
      closeSnackbar(key);
    }
  };

  return <AsyncTaskProviderContext.Provider value={{ launchAsyncTask }}>{children}</AsyncTaskProviderContext.Provider>;
};

export const useAsyncTask = () => {
  return { ...React.useContext(AsyncTaskProviderContext) };
};
