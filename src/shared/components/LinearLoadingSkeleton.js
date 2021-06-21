import { makeStyles, Box, LinearProgress } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  loadingSkeleton: {
    height: "4px",
    width: "100%"
  }
}));

export function LinearLoadingSkeleton({ isLoading }) {
  const classes = useStyles();

  return <>{isLoading ? <LinearProgress /> : <Box className={classes.loadingSkeleton} />}</>;
}
