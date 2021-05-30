import {
  Grid,
  FormLabel,
  makeStyles,
  Box,
  Button,
  IconButton,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem",
  },
  status: {
    marginLeft: "1rem",
    width: "1rem",
    height: "1rem",
    borderRadius: "1rem",
  },
  statusActive: {
    backgroundColor: "green",
  },
  statusClosed: {
    backgroundColor: "red",
  },
  actionContainer: {
    diplay: "flex",
    alignItems: "center",
    padding: "1rem 0",
    "& .MuiButtonBase-root:first-child": {
      marginLeft: 0,
    },
  },
  actionButton: {
    marginLeft: "1rem",
  },
}));

// Deployment
// cpuAmount: 1
// createdAt: 747596
// dseq: "747591"
// memoryAmount: 1073741824
// state: "active"
// storageAmount: 5368709120
// transferredAmount: "1202268"

export function DeploymentSubHeader({ deployment }) {
  const classes = useStyles();

  const handleMenuClick = (event) => {
    console.log("menu");
  };

  return (
    <Grid container spacing={2} classes={{ root: classes.root }}>
      <Grid item xs={3}>
        <LabelValue
          label="Status:"
          value={
            <>
              <div>{deployment.state}</div>
              <div
                className={clsx(classes.status, {
                  [classes.statusActive]: deployment.state === "active",
                  [classes.statusClosed]: deployment.state === "closed",
                })}
              />
            </>
          }
        />
      </Grid>
      <Grid item xs={5}>
        <LabelValue
          label="Escrow Balance:"
          value={`${deployment.transferredAmount}uakt`}
        />
      </Grid>
      <Grid item xs={4}>
        <LabelValue label="Time left:" value="TODO" />
      </Grid>
      <Grid item xs={3}>
        <LabelValue label="DSEQ:" value={deployment.dseq} />
      </Grid>
      <Grid item xs={5}>
        <LabelValue
          label="Amount spent:"
          value={`${deployment.transferredAmount}uakt`}
        />
      </Grid>
      <Grid item xs={4}>
        <LabelValue label="~cost/month:" value="TODO" />
      </Grid>

      <Box className={classes.actionContainer}>
        <Button
          variant="contained"
          color="primary"
          className={classes.actionButton}
        >
          Add funds
        </Button>
        <Button
          variant="contained"
          color="primary"
          className={classes.actionButton}
        >
          View manifest
        </Button>
        <Button
          variant="contained"
          color="primary"
          className={classes.actionButton}
        >
          Update deployment
        </Button>
        <IconButton
          aria-label="settings"
          aria-haspopup="true"
          onClick={handleMenuClick}
          className={classes.actionButton}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>
    </Grid>
  );
}
const useLabelStyles = makeStyles((theme) => ({
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

const LabelValue = ({ label, value }) => {
  const classes = useLabelStyles();

  return (
    <Box className={classes.root}>
      <FormLabel className={classes.label}>{label}</FormLabel>
      <div className={classes.value}>{value}</div>
    </Box>
  );
};