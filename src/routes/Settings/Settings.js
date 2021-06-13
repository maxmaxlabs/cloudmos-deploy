import { Box, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: { padding: "1rem" },
  title: {
    fontSize: "2rem",
    fontWeight: "bold"
  }
}));

export function Settings(props) {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Box className={classes.titleContainer}>
        <Typography variant="h3" className={classes.title}>
          Settings
        </Typography>
      </Box>

      
    </Box>
  );
}
