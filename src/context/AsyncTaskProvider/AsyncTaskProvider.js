import React from "react";
import { Button } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";

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
      <Snackbar
        title={message}
        subTitle={
          <Button onClick={onCancel} variant="contained" color="primary" size="small">
            Cancel
          </Button>
        }
        showLoading
      />,
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
