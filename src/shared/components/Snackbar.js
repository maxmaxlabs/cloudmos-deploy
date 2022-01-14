import { Typography, makeStyles } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  snackBarTitle: {
    fontSize: "1rem",
    lineHeight: "1rem",
    fontWeight: "bold"
  },
  marginBottom: {
    marginBottom: ".5rem"
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
      <Typography
        variant="h5"
        className={clsx(classes.snackBarTitle, {
          [classes.marginBottom]: !!subTitle
        })}
      >
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
