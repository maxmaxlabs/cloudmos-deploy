import { useState } from "react";
import { Grid, Menu, makeStyles, Box, Button, IconButton, MenuItem } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import { getAvgCostPerMonth, getTimeLeft, uaktToAKT } from "../../shared/utils/priceUtils";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import isValid from "date-fns/isValid";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";
import { useHistory } from "react-router";
import { useTransactionModal } from "../../context/TransactionModal";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { UrlService } from "../../shared/utils/urlUtils";
import { useGA4React } from "ga-4-react";

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

export function DeploymentSubHeader({ deployment, deploymentCost, address }) {
  const classes = useStyles();
  const timeLeft = getTimeLeft(deploymentCost, deployment.escrowBalance.amount);
  const [anchorEl, setAnchorEl] = useState(null);
  const { sendTransaction } = useTransactionModal();
  const ga4React = useGA4React();
  const history = useHistory();

  const onCloseDeployment = async () => {
    handleMenuClose();
    // TODO
    try {
      const message = TransactionMessageData.getCloseDeploymentMsg(address, deployment.dseq);
      // TODO handle response
      const response = await sendTransaction([message]);

      if (response) {
        history.push(`${UrlService.deploymentList()}?refetch=true`);

        ga4React.event("close deployment");
      }
    } catch (error) {
      throw error;
    }
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
          value={`${uaktToAKT(deployment.escrowBalance.amount, 6)}AKT`}
        />
      </Grid>
      <Grid item xs={4}>
        {deployment.state === "active" && <LabelValue label="Time left:" value={isValid(timeLeft) && formatDistanceToNow(timeLeft)} />}
      </Grid>
      <Grid item xs={3}>
        <LabelValue label="DSEQ:" value={deployment.dseq} />
      </Grid>
      <Grid item xs={5}>
        <LabelValue
          label="Amount spent:"
          // value={`${deployment.transferred.amount}${deployment.transferred.denom}`}
          value={`${uaktToAKT(deployment.transferred.amount, 6)}AKT`}
        />
      </Grid>
      <Grid item xs={4}>
        <LabelValue label="~Cost/Month:" value={`${getAvgCostPerMonth(deploymentCost)}AKT`} />
      </Grid>

      {deployment.state === "active" && (
        <Box className={classes.actionContainer}>
          <Button variant="contained" color="primary" className={classes.actionButton} onClick={() => alert("Coming soon!")}>
            Add funds
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
            <MenuItem onClick={() => onCloseDeployment()} classes={{ root: classes.menuItem }}>
              <CancelPresentationIcon />
              &nbsp;Close
            </MenuItem>
          </Menu>
        </Box>
      )}
    </Grid>
  );
}
