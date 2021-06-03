import { useState } from "react";
import { Grid, Menu, makeStyles, Box, Button, IconButton, MenuItem } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import { getAvgCostPerMonth, getTimeLeft, uaktToAKT } from "../../shared/utils/priceUtils";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import isValid from "date-fns/isValid";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";
import { closeDeployment } from "../../shared/utils/deploymentDetailUtils";
import CodeIcon from "@material-ui/icons/Code";
import { RAW_JSON_BIDS, RAW_JSON_DEPLOYMENT, RAW_JSON_LEASES } from "../../shared/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: "1rem"
  },
  actionContainer: {
    display: "flex",
    alignItems: "center",
    padding: "1rem .5rem",
    "& .MuiButtonBase-root:first-child": {
      marginLeft: 0
    }
  },
  actionButton: {
    marginLeft: ".5rem"
  },
  menuItem: {
    paddingBottom: "3px",
    paddingTop: "3px"
  }
}));

export function DeploymentSubHeader({ deployment, block, deploymentCost, address, selectedWallet, updateShownRawJson }) {
  const classes = useStyles();
  const timeLeft = getTimeLeft(deploymentCost, deployment.escrowBalance.amount);
  const [anchorEl, setAnchorEl] = useState(null);

  const onCloseDeployment = async () => {
    handleMenuClose();
    await closeDeployment(deployment, address, selectedWallet);
  };

  const onUpdateShownRawJson = (json) => {
    handleMenuClose();
    updateShownRawJson(json);
  };

  function handleMenuClick(ev) {
    setAnchorEl(ev.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
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
          <LabelValue label="Time left:" value={isValid(timeLeft) && formatDistanceToNow(timeLeft)} />
        </Grid>
      )}
      <Grid item xs={3}>
        <LabelValue label="DSEQ:" value={deployment.dseq} />
      </Grid>
      <Grid item xs={5}>
        <LabelValue
          label="Amount spent:"
          // value={`${deployment.transferred.amount}${deployment.transferred.denom}`}
          value={`${uaktToAKT(deployment.transferred.amount, 5)}AKT`}
        />
      </Grid>
      <Grid item xs={4}>
        <LabelValue label="~Cost/Month:" value={`${getAvgCostPerMonth(deploymentCost)}AKT`} />
      </Grid>

      <Box className={classes.actionContainer}>
        <Button variant="contained" color="primary" className={classes.actionButton}>
          Add funds
        </Button>
        <Button variant="contained" color="primary" className={classes.actionButton}>
          View manifest
        </Button>
        <Button variant="contained" color="primary" className={classes.actionButton}>
          Update deployment
        </Button>
        <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick} className={classes.actionButton}>
          <MoreVertIcon />
        </IconButton>

        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          keepMounted
          getContentAnchorEl={null}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
        >
          <MenuItem onClick={() => onUpdateShownRawJson(RAW_JSON_DEPLOYMENT)} classes={{ root: classes.menuItem }}>
            <CodeIcon />
            &nbsp;View deployment JSON
          </MenuItem>
          <MenuItem onClick={() => onUpdateShownRawJson(RAW_JSON_BIDS)} classes={{ root: classes.menuItem }}>
            <CodeIcon />
            &nbsp;View bids JSON
          </MenuItem>
          <MenuItem onClick={() => onUpdateShownRawJson(RAW_JSON_LEASES)} classes={{ root: classes.menuItem }}>
            <CodeIcon />
            &nbsp;View leases JSON
          </MenuItem>
          {deployment.state === "active" && (
            <MenuItem onClick={() => onCloseDeployment()} classes={{ root: classes.menuItem }}>
              <CancelPresentationIcon />
              &nbsp;Close
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Grid>
  );
}
