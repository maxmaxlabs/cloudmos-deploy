import { makeStyles, TextareaAutosize, Box, IconButton } from "@material-ui/core";
import { useSnackbar } from "notistack";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { Snackbar } from "../../shared/components/Snackbar";
import { copyTextToClipboard } from "../../shared/utils/copyClipboard";

const useStyles = makeStyles((theme) => ({
  textArea: {
    width: "100%",
    maxWidth: "100%",
    minWidth: "100%",
    fontSize: "1.3rem",
    fontFamily: "inherit",
    padding: "4px 16px 4px 8px"
  },
  copyButton: {
    position: "absolute",
    top: 0,
    right: 0
  }
}));

export function MnemonicTextarea({ mnemonic }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const onCopyClick = () => {
    copyTextToClipboard(mnemonic);
    enqueueSnackbar(<Snackbar title="Mnemonic copied to clipboard!" iconVariant="success" />, {
      variant: "success",
      autoHideDuration: 2000
    });
  };

  return (
    <Box position="relative">
      <TextareaAutosize value={mnemonic} className={classes.textArea} rowsMin={5} contentEditable={false} />

      <IconButton onClick={onCopyClick} className={classes.copyButton} size="small">
        <FileCopyIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
