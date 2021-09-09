import { useState } from "react";
import { Grid, Menu, makeStyles, Box, Button, IconButton, MenuItem } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import EditIcon from "@material-ui/icons/Edit";
import { getAvgCostPerMonth, getTimeLeft, uaktToAKT } from "../../shared/utils/priceUtils";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import isValid from "date-fns/isValid";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";
import { useHistory } from "react-router";
import { useTransactionModal } from "../../context/TransactionModal";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { UrlService } from "../../shared/utils/urlUtils";
import { analytics } from "../../shared/utils/analyticsUtils";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { DeploymentDeposit } from "./DeploymentDeposit";
import PublishIcon from "@material-ui/icons/Publish";

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
    paddingBottom: "5px",
    paddingTop: "5px"
  },
  menuItemLabel: {
    marginLeft: "1rem"
  }
}));

export function DeploymentSubHeader({ deployment, deploymentCost, address, loadDeploymentDetail }) {
  const classes = useStyles();
  const timeLeft = getTimeLeft(deploymentCost, deployment.escrowBalance.amount);
  const [anchorEl, setAnchorEl] = useState(null);
  const { sendTransaction } = useTransactionModal();
  const { changeDeploymentName, getDeploymentData } = useLocalNotes();
  const history = useHistory();
  const [isDepositingDeployment, setIsDepositingDeployment] = useState(false);
  const storageDeploymentData = getDeploymentData(deployment.dseq);

  const onCloseDeployment = async () => {
    handleMenuClose();

    try {
      const message = TransactionMessageData.getCloseDeploymentMsg(address, deployment.dseq);

      const response = await sendTransaction([message]);

      if (response) {
        history.push(UrlService.deploymentList());

        await analytics.event("deploy", "close deployment");
      }
    } catch (error) {
      throw error;
    }
  };

  function onChangeName() {
    handleMenuClose();
    changeDeploymentName(deployment.dseq);
  }

  function handleMenuClick(ev) {
    setAnchorEl(ev.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const redeploy = () => {
    const url = UrlService.createDeployment(deployment.dseq);
    history.push(url);
  };

  const onDeploymentDeposit = async (deposit) => {
    setIsDepositingDeployment(false);

    try {
      const message = TransactionMessageData.getDepositDeploymentMsg(address, deployment.dseq, deposit);

      const response = await sendTransaction([message]);

      if (response) {
        loadDeploymentDetail();

        await analytics.event("deploy", "deployment deposit");
      }
    } catch (error) {
      throw error;
    }
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
          <Button variant="contained" color="primary" className={classes.actionButton} onClick={() => setIsDepositingDeployment(true)}>
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
            <MenuItem onClick={() => onChangeName()} classes={{ root: classes.menuItem }}>
              <EditIcon />
              <div className={classes.menuItemLabel}>Edit Name</div>
            </MenuItem>
            {storageDeploymentData?.manifest && (
              <MenuItem onClick={() => redeploy()} classes={{ root: classes.menuItem }}>
                <PublishIcon />
                <div className={classes.menuItemLabel}>Redeploy</div>
              </MenuItem>
            )}
            <MenuItem onClick={() => onCloseDeployment()} classes={{ root: classes.menuItem }}>
              <CancelPresentationIcon />
              <div className={classes.menuItemLabel}>Close</div>
            </MenuItem>
          </Menu>
        </Box>
      )}
      {deployment.state === "closed" && (
        <Box className={classes.actionContainer}>
          <Button onClick={() => onChangeName()} variant="contained" color="default" className={classes.actionButton}>
            <EditIcon fontSize="small" />
            &nbsp;Edit Name
          </Button>

          {storageDeploymentData?.manifest && (
            <Button onClick={() => redeploy()} variant="contained" color="default" className={classes.actionButton}>
              <PublishIcon fontSize="small" />
              &nbsp;Redeploy
            </Button>
          )}
        </Box>
      )}

      <DeploymentDeposit
        isDepositingDeployment={isDepositingDeployment}
        handleCancel={() => setIsDepositingDeployment(false)}
        onDeploymentDeposit={onDeploymentDeposit}
      />
    </Grid>
  );
}
