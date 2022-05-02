import { makeStyles, Box, Tooltip } from "@material-ui/core";
import FileCopy from "@material-ui/icons/FileCopy";
import clsx from "clsx";
import { copyTextToClipboard } from "../../shared/utils/copyClipboard";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
  root: { display: "inline-flex", alignItems: "center", transition: "all .3s ease" },
  copy: {
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.info.dark
    }
  },
  copyIcon: {
    fontSize: "1rem",
    marginLeft: ".5rem",
    opacity: 0,
    transition: "all .3s ease"
  },
  showIcon: {
    opacity: 100
  },
  tooltip: {
    fontSize: ".8rem"
  }
}));

export const Address = ({ address, isCopyable, ...rest }) => {
  const [isOver, setIsOver] = useState(false);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const formattedAddress = [address?.slice(0, 10), ".....", address?.slice(address?.length - 6)].join("");

  const onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isCopyable) {
      copyTextToClipboard(address);
      enqueueSnackbar(<Snackbar title="Address copied to clipboard!" iconVariant="success" />, {
        variant: "success",
        autoHideDuration: 2000
      });
    }
  };

  return (
    <Tooltip classes={{ tooltip: classes.tooltip }} arrow title={address} interactive>
      <Box
        className={clsx(classes.root, { [classes.copy]: isCopyable })}
        component="span"
        onClick={onClick}
        onMouseOver={() => setIsOver(true)}
        onMouseOut={() => setIsOver(false)}
        {...rest}
      >
        <span>{formattedAddress}</span>

        {isCopyable && <FileCopy className={clsx(classes.copyIcon, { [classes.showIcon]: isOver })} />}
      </Box>
    </Tooltip>
  );
};
