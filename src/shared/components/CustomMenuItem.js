import React from "react";
import { makeStyles, Typography, MenuItem } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  menuItem: {
    display: "flex",
    alignItems: "center"
  },
  menuItemText: {
    marginLeft: ".5rem"
  }
}));

export const CustomMenuItem = React.forwardRef(({ onClick, icon, text, className = "" }, ref) => {
  const classes = useStyles();

  return (
    <MenuItem onClick={onClick} className={clsx(classes.menuItem, className)} ref={ref}>
      {icon}
      <Typography variant="body1" className={classes.menuItemText}>
        {text}
      </Typography>
    </MenuItem>
  );
});
