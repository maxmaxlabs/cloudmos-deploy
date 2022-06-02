import { lighten, makeStyles, Box, IconButton } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { copyTextToClipboard } from "../utils/copyClipboard";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { useRef } from "react";
import { selectText } from "../utils/stringUtils";
import { Snackbar } from "../../shared/components/Snackbar";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    padding: "1rem",
    borderRadius: theme.spacing(0.5),
    backgroundColor: lighten("#000", 0.9)
  },
  actions: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    padding: theme.spacing(0.5),
    display: "flex",
    justifyContent: "flex-end"
  }
}));

export const CodeSnippet = ({ code }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const codeRef = useRef();

  const onCopyClick = () => {
    copyTextToClipboard(code);
    enqueueSnackbar(<Snackbar title="Copied to clipboard!" iconVariant="success" />, { variant: "success", autoHideDuration: 1500 });
  };

  const onCodeClick = () => {
    selectText(codeRef.current);
  };

  return (
    <pre className={classes.root}>
      <Box className={classes.actions}>
        <IconButton aria-label="copy" aria-haspopup="true" onClick={onCopyClick} size="small">
          <FileCopyIcon />
        </IconButton>
      </Box>
      <code ref={codeRef} onClick={onCodeClick}>
        {code}
      </code>
    </pre>
  );
};
