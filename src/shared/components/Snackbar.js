import { Typography, makeStyles, CircularProgress, Box } from "@material-ui/core";
import clsx from "clsx";
import InfoIcon from "@material-ui/icons/Info";
import WarningIcon from "@material-ui/icons/Warning";
import ErrorIcon from "@material-ui/icons/Error";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

const useStyles = makeStyles((theme) => ({
  snackBarTitle: {
    fontSize: "1.1rem",
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
  },
  loading: {
    color: theme.palette.primary.contrastText
  }
}));

export function Snackbar({ title, subTitle, iconVariant, showLoading = false }) {
  const classes = useStyles();
  const icon = getIcon(iconVariant);

  return (
    <div>
      <Box
        display="flex"
        alignItems="center"
        className={clsx({
          [classes.marginBottom]: !!subTitle
        })}
      >
        {!!icon && (
          <Box display="flex" alignItems="center" paddingRight=".5rem">
            {icon}
          </Box>
        )}

        {showLoading && (
          <Box display="flex" alignItems="center" paddingRight=".5rem">
            <CircularProgress size="1rem" className={classes.loading} />
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

const getIcon = (variant) => {
  switch (variant) {
    case "info":
      return <InfoIcon fontSize="small" />;
    case "warning":
      return <WarningIcon fontSize="small" />;
    case "error":
      return <ErrorIcon fontSize="small" />;
    case "success":
      return <CheckCircleIcon fontSize="small" />;

    default:
      return null;
  }
};
