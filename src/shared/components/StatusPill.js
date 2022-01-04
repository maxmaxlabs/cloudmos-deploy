import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: "1rem"
  },
  small: {
    marginLeft: ".5rem",
    width: ".5rem",
    height: ".5rem"
  },
  medium: {
    marginLeft: "1rem",
    width: "1rem",
    height: "1rem"
  },
  statusActive: {
    backgroundColor: "green"
  },
  statusClosed: {
    backgroundColor: "red"
  }
}));

export function StatusPill({ state, style, size = "medium" }) {
  const classes = useStyles();

  return (
    <div
      style={style}
      className={clsx(classes.root, {
        [classes.small]: size === "small",
        [classes.medium]: size === "medium",
        [classes.statusActive]: state === "active",
        [classes.statusClosed]: state === "closed"
      })}
    />
  );
}
