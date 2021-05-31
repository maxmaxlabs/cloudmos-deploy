import { makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: "1rem",
    width: "1rem",
    height: "1rem",
    borderRadius: "1rem",
  },
  statusActive: {
    backgroundColor: "green",
  },
  statusClosed: {
    backgroundColor: "red",
  },
}));

export function StatusPill({ state }) {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, {
        [classes.statusActive]: state === "active",
        [classes.statusClosed]: state === "closed",
      })}
    />
  );
}
