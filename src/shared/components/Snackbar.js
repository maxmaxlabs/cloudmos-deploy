import { Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  snackBarTitle: {
    fontSize: "1rem",
    lineHeight: "1rem",
    fontWeight: "bold"
  },
  snackBarSubTitle: {
    fontSize: ".9rem",
    wordBreak: "break-word"
  }
}));

export function Snackbar({ title, subTitle }) {
  const classes = useStyles();
  return (
    <div>
      <Typography variant="h5" className={classes.snackBarTitle}>
        {title}
      </Typography>
      {subTitle && (
        <Typography variant="body1" className={classes.snackBarSubTitle}>
          {subTitle}
        </Typography>
      )}
    </div>
  );
}
