import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItem: "center",
    fontWeight: "bold",
    fontSize: "3rem",
    textAlign: "center",
    justifyContent: "center",
    "& img": {
      width: "3rem",
      height: "3rem",
      marginRight: "1rem"
    }
  }
}));

export const TitleLogo = () => {
  const classes = useStyles();

  return (
    <Typography variant="h1" className={classes.root}>
      <img src="./icon.png" alt="Cloudmos Logo" />
      Cloudmos Deploy
    </Typography>
  );
};
