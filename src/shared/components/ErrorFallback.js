import { makeStyles, Typography, Button } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    padding: "10px 0",
    flexDirection: "column",
    textAlign: "center",
    maxWidth: 300,
    maring: "0 auto"
  },
  heading: {
    marginBottom: "2rem"
  },
  alert: {
    marginBottom: "2rem",
    textAlign: "left"
  }
}));

export function ErrorFallback({ error, resetErrorBoundary }) {
  const classes = useStyles();

  return (
    <div className={classes.root} role="alert">
      <Typography variant="h4" className={classes.heading}>
        Something went wrong:
      </Typography>

      <Alert severity="error" className={classes.alert}>
        <AlertTitle>Error</AlertTitle>
        {error.message}
      </Alert>

      <Button variant="contained" color="primary" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}
