import { makeStyles, Box, FormLabel } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: { display: "flex", alignItems: "center" },
  label: {
    fontWeight: "bold",
    color: "black",
    fontSize: ".9rem"
  },
  value: {
    display: "flex",
    alignItems: "center",
    marginLeft: ".5rem",
    fontSize: ".9rem"
  }
}));

export const LabelValue = ({ label, value, ...rest }) => {
  const classes = useStyles();

  return (
    <Box className={clsx(classes.root)} {...rest}>
      <FormLabel className={classes.label}>{label}</FormLabel>
      <div className={classes.value}>{value}</div>
    </Box>
  );
};
