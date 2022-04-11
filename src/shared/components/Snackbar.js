import { Typography, makeStyles, CircularProgress, Box } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  snackBarTitle: {
    fontSize: "1rem",
    lineHeight: "1rem",
    fontWeight: "bold",
    flexGrow: 1
  },
  marginBottom: {
    marginBottom: ".5rem"
  },
  snackBarSubTitle: {
    fontSize: ".9rem",
    wordBreak: "break-word"
  }
}));

export function Snackbar({ title, subTitle, showLoading = false }) {
  const classes = useStyles();
  return (
    <div>
      <Box
        display="flex"
        alignItems="center"
        className={clsx({
          [classes.marginBottom]: !!subTitle
        })}
      >
        {showLoading && (
          <Box display="flex" alignItems="center" paddingRight=".5rem">
            <CircularProgress size="1rem" />
          </Box>
        )}
        <Typography variant="h5" className={classes.snackBarTitle}>
          {title}
        </Typography>
      </Box>

      {subTitle && (
        <Typography variant="body1" className={classes.snackBarSubTitle}>
          {subTitle}
        </Typography>
      )}
    </div>
  );
}
