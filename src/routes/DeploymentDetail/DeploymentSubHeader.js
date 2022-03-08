import { useState } from "react";
import { Grid, Menu, makeStyles, Box, Button, IconButton, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
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
import { DeploymentDepositModal } from "./DeploymentDepositModal";
import PublishIcon from "@material-ui/icons/Publish";
import { PricePerMonth } from "../../shared/components/PricePerMonth";
import { PriceValue } from "../../shared/components/PriceValue";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";
import { CustomMenuItem } from "../../shared/components/CustomMenuItem";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem 1rem .5rem"
  },
  actionContainer: {
    paddingTop: ".5rem",
    display: "flex",
    alignItems: "center",
    "& .MuiButtonBase-root:first-child": {
      marginLeft: 0
    }
  },
  actionButton: {
    marginLeft: ".5rem"
  },
  tooltip: {
    fontSize: "1rem"
  },
  tooltipIcon: {
    fontSize: "1rem",
    color: theme.palette.text.secondary
  }
}));

export function DeploymentSubHeader({ deployment, deploymentCost, address, loadDeploymentDetail, removeLeases }) {
  const classes = useStyles();
  const timeLeft = getTimeLeft(deploymentCost, deployment.escrowBalance.amount);
  const [anchorEl, setAnchorEl] = useState(null);
  const { sendTransaction } = useTransactionModal();
  const { changeDeploymentName, getDeploymentData } = useLocalNotes();
  const history = useHistory();
  const [isDepositingDeployment, setIsDepositingDeployment] = useState(false);
  const storageDeploymentData = getDeploymentData(deployment.dseq);
  const avgCost = getAvgCostPerMonth(deploymentCost);

  const onCloseDeployment = async () => {
    handleMenuClose();

    try {
      const message = TransactionMessageData.getCloseDeploymentMsg(address, deployment.dseq);

      const response = await sendTransaction([message]);

      if (response) {
        removeLeases();

        loadDeploymentDetail();

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

  const onDeploymentDeposit = async (deposit, depositorAddress) => {
    setIsDepositingDeployment(false);

    try {
      const message = TransactionMessageData.getDepositDeploymentMsg(address, deployment.dseq, deposit, depositorAddress);

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
    <div className={classes.root}>
      <Grid container spacing={2}>
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
          <Box display="flex" alignItems="center">
            <LabelValue
              label="Escrow Balance:"
              value={
                <>
                  {uaktToAKT(deployment.escrowBalance.amount, 6)}AKT{" "}
                  <Box component="span" display="inline-flex" marginLeft=".5rem">
                    <Tooltip
                      classes={{ tooltip: classes.tooltip }}
                      arrow
                      title="The escrow account balance will be fully returned to your wallet balance when the deployment is closed."
                    >
                      <InfoIcon className={classes.tooltipIcon} />
                    </Tooltip>
                  </Box>
                </>
              }
            />
            <Box marginLeft=".5rem"></Box>
          </Box>
        </Grid>
        <Grid item xs={4}>
          {deployment.state === "active" && <LabelValue label="Time left:" value={isValid(timeLeft) && formatDistanceToNow(timeLeft)} />}
        </Grid>
        <Grid item xs={3}>
          <LabelValue label="DSEQ:" value={deployment.dseq} />
        </Grid>
        <Grid item xs={5}>
          <LabelValue label="Amount spent:" value={`${uaktToAKT(deployment.transferred.amount, 6)}AKT`} />

          {deployment.transferred.amount && (
            <strong>
              ~<PriceValue value={uaktToAKT(deployment.transferred.amount, 6)} />
            </strong>
          )}
        </Grid>
        <Grid item xs={4}>
          <LabelValue label="Cost/Month:" value={`~${avgCost}AKT`} />
          <Box display="flex" alignItems="center">
            {deploymentCost && <PricePerMonth perBlockValue={uaktToAKT(deploymentCost, 6)} />}
            {deploymentCost && <PriceEstimateTooltip value={uaktToAKT(deploymentCost, 6)} />}
          </Box>
        </Grid>
      </Grid>

      {deployment.state === "active" && (
        <Box className={classes.actionContainer}>
          <Button variant="contained" color="primary" className={classes.actionButton} onClick={() => setIsDepositingDeployment(true)} size="small">
            Add funds
          </Button>
          <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick} className={classes.actionButton} size="small">
            <MoreHorizIcon fontSize="large" />
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
            <CustomMenuItem onClick={() => onChangeName()} icon={<EditIcon fontSize="small" />} text="Edit Name" />
            {storageDeploymentData?.manifest && <CustomMenuItem onClick={() => redeploy()} icon={<PublishIcon fontSize="small" />} text="Redeploy" />}
            <CustomMenuItem onClick={() => onCloseDeployment()} icon={<CancelPresentationIcon fontSize="small" />} text="Close" />
          </Menu>
        </Box>
      )}

      {deployment.state === "closed" && (
        <Box className={classes.actionContainer}>
          <Button onClick={() => onChangeName()} variant="contained" color="default" className={classes.actionButton} size="small">
            <EditIcon fontSize="small" />
            &nbsp;Edit Name
          </Button>

          {storageDeploymentData?.manifest && (
            <Button onClick={() => redeploy()} variant="contained" color="default" className={classes.actionButton} size="small">
              <PublishIcon fontSize="small" />
              &nbsp;Redeploy
            </Button>
          )}
        </Box>
      )}

      {isDepositingDeployment && <DeploymentDepositModal handleCancel={() => setIsDepositingDeployment(false)} onDeploymentDeposit={onDeploymentDeposit} />}
    </div>
  );
}
