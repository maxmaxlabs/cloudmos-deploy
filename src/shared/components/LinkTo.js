import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    display: "inline-flex",
    margin: 0,
    padding: 0,
    color: "#0000EE",
    "&:visited": {
      color: "#551A8B"
    },
    "&:disabled": {
      color: theme.palette.grey[500],
      cursor: "initial"
    }
  }
}));

export const LinkTo = ({ children, ...rest }) => {
  const classes = useStyles();
  return (
    <button type="button" {...rest} className={clsx(rest?.className, classes.root)}>
      {children}
    </button>
  );
};
