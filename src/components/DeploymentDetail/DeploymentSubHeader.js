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
import {
  getAvgCostPerMonth,
  getTimeLeft,
  uaktToAKT,
} from "../../shared/utils/priceUtils";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import isValid from "date-fns/isValid";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: "1rem",
  },
  actionContainer: {
    display: "flex",
    alignItems: "center",
    padding: "1rem .5rem",
    "& .MuiButtonBase-root:first-child": {
      marginLeft: 0,
    },
  },
  actionButton: {
    marginLeft: ".5rem",
  },
}));

export function DeploymentSubHeader({ deployment, block, deploymentCost }) {
  const classes = useStyles();
  const timeLeft = getTimeLeft(deploymentCost, deployment.escrowBalance.amount);

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
              <StatusPill state={deployment.state} />
            </>
          }
        />
      </Grid>
      <Grid item xs={5}>
        <LabelValue
          label="Escrow Balance:"
          // value={`${deployment.escrowBalance.amount}${deployment.escrowBalance.denom}`}
          value={`${uaktToAKT(deployment.escrowBalance.amount)}AKT`}
        />
      </Grid>
      {deployment.state === "active" && (
        <Grid item xs={4}>
          <LabelValue
            label="Time left:"
            value={isValid(timeLeft) && formatDistanceToNow(timeLeft)}
          />
        </Grid>
      )}
      <Grid item xs={3}>
        <LabelValue label="DSEQ:" value={deployment.dseq} />
      </Grid>
      <Grid item xs={5}>
        <LabelValue
          label="Amount spent:"
          // value={`${deployment.transferred.amount}${deployment.transferred.denom}`}
          value={`${uaktToAKT(deployment.transferred.amount, 100000)}AKT`}
        />
      </Grid>
      <Grid item xs={4}>
        <LabelValue
          label="~Cost/Month:"
          value={`${getAvgCostPerMonth(deploymentCost)}AKT`}
        />
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
