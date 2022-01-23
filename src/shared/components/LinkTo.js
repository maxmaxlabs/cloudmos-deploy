import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    display: "inline",
    margin: 0,
    padding: 0,
    color: theme.palette.info.dark
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
