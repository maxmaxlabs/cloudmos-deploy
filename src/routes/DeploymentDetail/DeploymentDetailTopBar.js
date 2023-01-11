import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Menu, Box, Button, IconButton, makeStyles, Typography } from "@material-ui/core";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { useTransactionModal } from "../../context/TransactionModal";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { UrlService } from "../../shared/utils/urlUtils";
import { analytics } from "../../shared/utils/analyticsUtils";
import { DeploymentDepositModal } from "./DeploymentDepositModal";
import PublishIcon from "@material-ui/icons/Publish";
import { CustomMenuItem } from "../../shared/components/CustomMenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import RefreshIcon from "@material-ui/icons/Refresh";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import EditIcon from "@material-ui/icons/Edit";
import clsx from "clsx";
import AddAlertIcon from "@material-ui/icons/AddAlert";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: ".5rem",
    marginTop: "-4px",
    borderBottom: `1px solid ${theme.palette.grey[300]}`
  },
  title: {
    fontWeight: "bold",
    marginLeft: ".5rem",
    fontSize: "1.5rem"
  },
  actionContainer: {
    marginLeft: ".5rem",
    display: "flex",
    alignItems: "center",
    "& .MuiButtonBase-root:first-child": {
      marginLeft: 0
    }
  },
  actionButton: {
    marginLeft: ".5rem",
    whiteSpace: "nowrap"
  }
}));

export function DeploymentDetailTopBar({ address, loadDeploymentDetail, removeLeases, setActiveTab, deployment }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const { sendTransaction } = useTransactionModal();
  const { changeDeploymentName, getDeploymentData, getDeploymentName } = useLocalNotes();
  const history = useHistory();
  const [isDepositingDeployment, setIsDepositingDeployment] = useState(false);
  const storageDeploymentData = getDeploymentData(deployment?.dseq);
  const deploymentName = getDeploymentName(deployment?.dseq);
  const isActive = deployment?.state === "active";

  function handleBackClick() {
    history.goBack();
  }

  const onCloseDeployment = async () => {
    handleMenuClose();

    try {
      const message = TransactionMessageData.getCloseDeploymentMsg(address, deployment.dseq);

      const response = await sendTransaction([message]);

      if (response) {
        setActiveTab("LEASES");

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

  const onSetAlert = () => {
    window.electron.openUrl(
      UrlService.alertsCreate(null, "akash", "deployment-balance-monitor", {
        owner: { operator: "eq", value: address },
        dseq: { operator: "eq", value: deployment.dseq }
      })
    );

    handleMenuClose();
  };

  return (
    <>
      <div className={classes.root}>
        <IconButton aria-label="back" onClick={handleBackClick} size="small">
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h3" className={clsx(classes.title, "text-truncate")}>
          Deployment detail
          {deploymentName && (
            <Box component="span" fontWeight="normal">
              {" "}
              - {deploymentName}
            </Box>
          )}
        </Typography>

        <Box marginLeft=".5rem">
          <IconButton aria-label="back" onClick={() => loadDeploymentDetail()} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>

        {deployment?.state === "active" && (
          <Box className={classes.actionContainer}>
            <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick} className={classes.actionButton} size="small">
              <MoreHorizIcon fontSize="default" />
            </IconButton>
            <Button variant="contained" color="primary" className={classes.actionButton} onClick={() => setIsDepositingDeployment(true)} size="small">
              Add funds
            </Button>

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
              {isActive && <CustomMenuItem onClick={() => onSetAlert()} icon={<AddAlertIcon fontSize="small" />} text="Balance Alert" />}
              <CustomMenuItem onClick={() => onCloseDeployment()} icon={<CancelPresentationIcon fontSize="small" />} text="Close" />
            </Menu>
          </Box>
        )}

        {deployment?.state === "closed" && (
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
      </div>

      {isDepositingDeployment && <DeploymentDepositModal handleCancel={() => setIsDepositingDeployment(false)} onDeploymentDeposit={onDeploymentDeposit} />}
    </>
  );
}
