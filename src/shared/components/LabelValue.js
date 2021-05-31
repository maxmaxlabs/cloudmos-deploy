import { makeStyles, Box, FormLabel } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: { display: "flex", alignItems: "center" },
  label: {
    fontWeight: "bold",
    color: "black",
  },
  value: {
    display: "flex",
    alignItems: "center",
    marginLeft: "1rem",
  },
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
