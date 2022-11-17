import { useState } from "react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AddIcon from "@material-ui/icons/Add";
import WarningIcon from "@material-ui/icons/Warning";
import { makeStyles, IconButton, Box, Typography, CircularProgress, Checkbox, Menu, Tooltip } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { useHistory } from "react-router";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { useDeploymentLeaseList } from "../../queries";
import { useWallet } from "../../context/WalletProvider";
import { SpecDetailNew } from "../../shared/components/SpecDetailNew";
import { LeaseChip } from "./LeaseChip";
import { getTimeLeft, uaktToAKT } from "../../shared/utils/priceUtils";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import isValid from "date-fns/isValid";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import { useTransactionModal } from "../../context/TransactionModal";
import { analytics } from "../../shared/utils/analyticsUtils";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { CustomMenuItem } from "../../shared/components/CustomMenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import { DeploymentDepositModal } from "../DeploymentDetail/DeploymentDepositModal";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import { useRealTimeLeft } from "../../shared/utils/priceUtils";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: ".5rem 1rem",
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    cursor: "pointer",
    transition: "background-color .2s ease",
    "&:hover": {
      backgroundColor: theme.palette.grey[300]
    }
  },
  titleContainer: {
    paddingBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  infoContainer: {
    flexGrow: "1",
    padding: "0 1rem",
    flex: 1,
    minWidth: 0
  },
  deploymentInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: "2px",
    fontSize: ".875rem",
    lineHeight: "1rem"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold"
  },
  dseq: {
    display: "inline",
    fontSize: "12px"
  },
  leaseChip: {
    marginLeft: ".5rem"
  },
  warningIcon: {
    fontSize: "1rem",
    marginLeft: ".5rem",
    color: theme.palette.error.main
  },
  editButton: {
    marginLeft: ".5rem",
    color: theme.palette.grey[400],
    transition: "color .3s ease",
    "&:hover": {
      color: theme.palette.text.primary
    }
  },
  editIcon: {
    fontSize: ".9rem"
  },
  tooltip: {
    fontSize: "1rem"
  },
  tooltipIcon: {
    fontSize: "1rem"
  }
}));

export function DeploymentListRow({ deployment, isSelectable, onSelectDeployment, checked, providers, refreshDeployments }) {
  const classes = useStyles();
  const history = useHistory();
  const { sendTransaction } = useTransactionModal();
  const [isDepositingDeployment, setIsDepositingDeployment] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { changeDeploymentName } = useLocalNotes();
  const { address } = useWallet();
  const isActive = deployment.state === "active";
  const { data: leases, isLoading: isLoadingLeases } = useDeploymentLeaseList(address, deployment, { enabled: !!deployment && isActive });
  const hasLeases = leases && !!leases.length;
  const hasActiveLeases = hasLeases && leases.some((l) => l.state === "active");
  const deploymentCost = hasLeases ? leases.reduce((prev, current) => prev + current.price.amount, 0) : 0;
  const timeLeft = getTimeLeft(deploymentCost, deployment.escrowBalance);
  const realTimeLeft = useRealTimeLeft(deploymentCost, deployment.escrowBalance, deployment.escrowAccount.settled_at, deployment.createdAt);
  const deploymentName = deployment.name ? (
    <>
      <Typography variant="body2" className="text-truncate">
        <strong>{deployment.name}</strong>
      </Typography>
      <span className={classes.dseq}>&nbsp;-&nbsp;{deployment.dseq}</span>
    </>
  ) : (
    <span className={classes.dseq}>{deployment.dseq}</span>
  );
  const showWarning = differenceInCalendarDays(timeLeft, new Date()) < 7;
  const escrowBalance = isActive && hasActiveLeases ? realTimeLeft?.escrow : deployment.escrowBalance;
  const amountSpent = isActive && hasActiveLeases ? realTimeLeft?.amountSpent : deployment.transferred.amount;
  const isValidTimeLeft = isActive && hasActiveLeases && isValid(realTimeLeft?.timeLeft);

  function viewDeployment() {
    history.push("/deployment/" + deployment.dseq);
  }

  function handleMenuClick(ev) {
    ev.stopPropagation();
    setAnchorEl(ev.currentTarget);
  }

  const handleMenuClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const onDeploymentDeposit = async (deposit, depositorAddress) => {
    setIsDepositingDeployment(false);

    try {
      const message = TransactionMessageData.getDepositDeploymentMsg(address, deployment.dseq, deposit, depositorAddress);

      const response = await sendTransaction([message]);

      if (response) {
        refreshDeployments();

        await analytics.event("deploy", "deployment deposit");
      }
    } catch (error) {
      throw error;
    }
  };

  const onCloseDeployment = async () => {
    handleMenuClose();

    try {
      const message = TransactionMessageData.getCloseDeploymentMsg(address, deployment.dseq);

      const response = await sendTransaction([message]);

      if (response) {
        refreshDeployments();

        await analytics.event("deploy", "close deployment");
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <div className={classes.root} onClick={() => viewDeployment()}>
        <div>
          <SpecDetailNew cpuAmount={deployment.cpuAmount} memoryAmount={deployment.memoryAmount} storageAmount={deployment.storageAmount} isActive={isActive} />
        </div>

        <div className={classes.infoContainer}>
          <div className={classes.deploymentInfo}>
            <Box display="flex" alignItems="baseline" flex={1} minWidth={0}>
              {deploymentName}
            </Box>
          </div>

          {isActive && (
            <div className={classes.deploymentInfo}>
              {isValidTimeLeft && (
                <Box component="span" display="flex" alignItems="center">
                  Time left:&nbsp;<strong>~{formatDistanceToNow(realTimeLeft?.timeLeft)}</strong>
                  {showWarning && <WarningIcon fontSize="small" color="error" className={classes.warningIcon} />}
                </Box>
              )}

              {!!escrowBalance && (
                <Box marginLeft={isValidTimeLeft ? "1rem" : 0} display="flex">
                  Balance:&nbsp;<strong>{uaktToAKT(escrowBalance, 2)} AKT</strong>
                  {escrowBalance <= 0 && (
                    <Tooltip
                      classes={{ tooltip: classes.tooltip }}
                      arrow
                      title="Your deployment is out of funds and can be closed by your provider at any time now. You can add funds to keep active."
                    >
                      <WarningIcon color="error" className={clsx(classes.tooltipIcon, classes.warningIcon)} />
                    </Tooltip>
                  )}
                </Box>
              )}

              {!!amountSpent && (
                <Box marginLeft="1rem" display="flex">
                  Spent:&nbsp;<strong>{uaktToAKT(amountSpent, 2)} AKT</strong>
                </Box>
              )}
            </div>
          )}

          {hasLeases && (
            <Box display="flex" alignItems="center" flexWrap="wrap">
              <Typography variant="caption">Leases</Typography>{" "}
              {leases?.map((lease) => (
                <LeaseChip key={lease.id} lease={lease} providers={providers} />
              ))}
            </Box>
          )}

          {isLoadingLeases && <CircularProgress size="1rem" />}
        </div>

        <Box padding="0 1rem" display="flex" alignItems="center">
          {isSelectable && (
            <Checkbox
              checked={checked}
              size="small"
              onClick={(event) => {
                event.stopPropagation();
              }}
              onChange={(event) => {
                onSelectDeployment(event.target.checked, deployment.dseq);
              }}
            />
          )}

          <Box marginLeft=".2rem">
            <IconButton onClick={handleMenuClick} size="small">
              <MoreHorizIcon />
            </IconButton>
          </Box>

          <Box marginLeft=".5rem" display="flex">
            <ChevronRightIcon />
          </Box>
        </Box>
      </div>

      <Menu
        id={`deployment-list-menu-${deployment.dseq}`}
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
        onClick={handleMenuClose}
      >
        {isActive && <CustomMenuItem onClick={() => setIsDepositingDeployment(true)} icon={<AddIcon fontSize="small" />} text="Deposit" />}
        <CustomMenuItem onClick={() => changeDeploymentName(deployment.dseq)} icon={<EditIcon fontSize="small" />} text="Edit name" />
        {isActive && <CustomMenuItem onClick={() => onCloseDeployment()} icon={<CancelPresentationIcon fontSize="small" />} text="Close" />}
      </Menu>

      {isActive && isDepositingDeployment && (
        <DeploymentDepositModal handleCancel={() => setIsDepositingDeployment(false)} onDeploymentDeposit={onDeploymentDeposit} />
      )}
    </>
  );
}
