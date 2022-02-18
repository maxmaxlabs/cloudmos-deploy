import { makeStyles, Box } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    overflowY: "auto"
  }
}));

export const Layout = ({ children, ...rest }) => {
  const classes = useStyles();
  return (
    <Box className={classes.root} {...rest}>
      {children}
    </Box>
  );
};
