import { useState } from "react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AddIcon from "@material-ui/icons/Add";
import WarningIcon from "@material-ui/icons/Warning";
import { makeStyles, IconButton, Box, Typography, CircularProgress, Checkbox, Menu } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import { useHistory } from "react-router";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { useLeaseList } from "../../queries";
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
    padding: "0 1rem"
  },
  deploymentInfo: {
    display: "flex",
    alignItems: "center",
    marginBottom: "2px",
    fontSize: ".875rem",
    lineHeight: ".875rem"
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
    marginLeft: ".5rem"
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
  }
}));

export function DeploymentListRow({ deployment, isSelectable, onSelectDeployment, checked, providers, refreshDeployments }) {
  const classes = useStyles();
  const history = useHistory();
  const { sendTransaction } = useTransactionModal();
  const [isDepositingDeployment, setIsDepositingDeployment] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { getDeploymentName, changeDeploymentName } = useLocalNotes();
  const { address } = useWallet();
  const isActive = deployment.state === "active";
  const { data: leases, isLoading: isLoadingLeases } = useLeaseList(deployment, address, { enabled: !!deployment && isActive });
  const name = getDeploymentName(deployment.dseq);
  const hasLeases = leases && !!leases.length;
  const deploymentCost = hasLeases ? leases.reduce((prev, current) => prev + current.price.amount, 0) : 0;
  const timeLeft = getTimeLeft(deploymentCost, deployment.escrowBalance);
  const deploymentName = name ? (
    <>
      <Typography variant="body2">
        <strong>{name}</strong>
      </Typography>
      <span className={classes.dseq}>&nbsp;-&nbsp;{deployment.dseq}</span>
    </>
  ) : (
    <span className={classes.dseq}>{deployment.dseq}</span>
  );
  const showWarning = differenceInCalendarDays(timeLeft, new Date()) < 7;

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

  return (
    <>
      <div className={classes.root} onClick={() => viewDeployment()}>
        <div>
          <SpecDetailNew cpuAmount={deployment.cpuAmount} memoryAmount={deployment.memoryAmount} storageAmount={deployment.storageAmount} isActive={isActive} />
        </div>

        <div className={classes.infoContainer}>
          <div className={classes.deploymentInfo}>
            <Box display="flex" alignItems="baseline">
              {deploymentName}
            </Box>

            {isActive && isValid(timeLeft) && (
              <Box component="span" marginLeft="1rem" display="flex" alignItems="center">
                Time left:&nbsp;<strong>~{formatDistanceToNow(timeLeft)}</strong>
                {showWarning && <WarningIcon fontSize="small" color="error" className={classes.warningIcon} />}
              </Box>
            )}

            {isActive && !!deployment.escrowBalance && (
              <Box marginLeft="1rem" display="flex">
                Escrow:&nbsp;<strong>{uaktToAKT(deployment.escrowBalance, 2)} AKT</strong>
              </Box>
            )}
          </div>

          {hasLeases && (
            <Box display="flex" alignItems="center" flexWrap="wrap">
              <Typography variant="caption">Leases:</Typography>{" "}
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
      </Menu>

      {isActive && isDepositingDeployment && (
        <DeploymentDepositModal handleCancel={() => setIsDepositingDeployment(false)} onDeploymentDeposit={onDeploymentDeposit} />
      )}
    </>
  );
}
