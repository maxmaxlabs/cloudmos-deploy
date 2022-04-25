import { SnackbarProvider } from "notistack";
import React, { useRef } from "react";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton, makeStyles, Box } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem",
    width: "360px !important",
    "& #notistack-snackbar": {
      paddingRight: "1rem"
    }
  },
  success: {
    backgroundColor: ""
  },
  error: {
    backgroundColor: ""
  },
  warning: {
    backgroundColor: ""
  },
  info: {
    backgroundColor: ""
  },
  action: {
    position: "absolute",
    top: "4px",
    right: "4px",
    color: theme.palette.info.contrastText
  }
}));
export const CustomSnackbarProvider = ({ children }) => {
  const notistackRef = useRef();
  const classes = useStyles();
  const onClickDismiss = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      ref={notistackRef}
      classes={{
        containerRoot: classes.root,
        variantSuccess: classes.success,
        variantError: classes.error,
        variantWarning: classes.warning,
        variantInfo: classes.info
      }}
      hideIconVariant
      action={(key) => (
        <Box width="2rem">
          <IconButton onClick={onClickDismiss(key)} size="small" className={classes.action}>
            <CloseIcon fontSize="1rem" />
          </IconButton>
        </Box>
      )}
    >
      {children}
    </SnackbarProvider>
  );
};
