import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import WarningIcon from "@material-ui/icons/Warning";
import { makeStyles, IconButton, Box, Typography, CircularProgress, Checkbox } from "@material-ui/core";
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

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: ".5rem 1rem",
    borderBottom: `1px solid ${theme.palette.grey[300]}`
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

export function DeploymentListRow({ deployment, isSelectable, onSelectDeployment, checked, providers }) {
  const classes = useStyles();
  const history = useHistory();
  const { getDeploymentName, changeDeploymentName } = useLocalNotes();
  const { address } = useWallet();
  const { data: leases, isLoading: isLoadingLeases } = useLeaseList(deployment, address, { enabled: !!deployment && deployment.state === "active" });
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

  return (
    <div className={classes.root}>
      <div>
        <SpecDetailNew
          cpuAmount={deployment.cpuAmount}
          memoryAmount={deployment.memoryAmount}
          storageAmount={deployment.storageAmount}
          isActive={deployment.state === "active"}
        />
      </div>

      <div className={classes.infoContainer}>
        <Box component="span" display="flex" alignItems="center" marginBottom="2px">
          <Box display="flex" alignItems="center">
            {deploymentName}
            <IconButton size="small" onClick={() => changeDeploymentName(deployment.dseq)} className={classes.editButton}>
              <EditIcon fontSize="small" className={classes.editIcon} />
            </IconButton>
          </Box>

          {isValid(timeLeft) && (
            <Box component="span" marginLeft="1rem" display="flex" alignItems="center">
              <Typography variant="caption">
                Time left: <strong>~{formatDistanceToNow(timeLeft)}</strong>
              </Typography>

              {showWarning && <WarningIcon fontSize="small" color="error" className={classes.warningIcon} />}
            </Box>
          )}

          {!!deployment.escrowBalance && (
            <Box marginLeft="1rem" display="flex">
              <Typography variant="caption">
                Escrow: <strong>{uaktToAKT(deployment.escrowBalance, 2)} AKT</strong>
              </Typography>
            </Box>
          )}
        </Box>

        {hasLeases && (
          <Box display="flex" alignItems="center">
            <Typography variant="caption">Leases:</Typography>{" "}
            {leases?.map((lease) => (
              <LeaseChip key={lease.id} lease={lease} providers={providers} />
            ))}
          </Box>
        )}

        {isLoadingLeases && <CircularProgress size="1rem" />}
      </div>

      <Box padding="0 1rem">
        {isSelectable && (
          <Checkbox
            checked={checked}
            size="medium"
            onChange={(event) => {
              onSelectDeployment(event.target.checked, deployment.dseq);
            }}
          />
        )}

        <IconButton edge="end" onClick={viewDeployment}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </div>
  );
}
