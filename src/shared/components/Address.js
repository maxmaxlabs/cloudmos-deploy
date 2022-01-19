import { makeStyles, Box, Tooltip } from "@material-ui/core";
import FileCopy from "@material-ui/icons/FileCopy";
import clsx from "clsx";
import { copyTextToClipboard } from "../../shared/utils/copyClipboard";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";

const useStyles = makeStyles((theme) => ({
  root: { display: "inline-flex", alignItems: "center" },
  copy: {
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.info.dark
    }
  },
  copyIcon: {
    fontSize: "1rem",
    marginLeft: ".5rem"
  },
  tooltip: {
    fontSize: ".8rem"
  }
}));

export const Address = ({ address, isCopyable, ...rest }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const formattedAddress = [address?.slice(0, 10), ".....", address?.slice(address?.length - 10)].join("");

  const onClick = () => {
    if (isCopyable) {
      copyTextToClipboard(address);
      enqueueSnackbar(<Snackbar title="Address copied to clipboard!" />, {
        variant: "success",
        autoHideDuration: 2000
      });
    }
  };

  return (
    <Tooltip classes={{ tooltip: classes.tooltip }} arrow title={address}>
      <Box className={clsx(classes.root, { [classes.copy]: isCopyable })} component="span" onClick={onClick} {...rest}>
        <span>{formattedAddress}</span>

        {isCopyable && <FileCopy className={classes.copyIcon} />}
      </Box>
    </Tooltip>
  );
};
