import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import CloudIcon from "@material-ui/icons/Cloud";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import WarningIcon from "@material-ui/icons/Warning";
import {
  makeStyles,
  IconButton,
  Box,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  CircularProgress,
  Checkbox
} from "@material-ui/core";
import { useHistory } from "react-router";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { useLeaseList } from "../../queries";
import { useWallet } from "../../context/WalletProvider";
import { SpecDetail } from "../../shared/components/SpecDetail";
import { LeaseChip } from "./LeaseChip";
import { getTimeLeft, uaktToAKT } from "../../shared/utils/priceUtils";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import isValid from "date-fns/isValid";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 0,
    paddingBottom: 0,
    borderBottom: `1px solid ${theme.palette.grey[300]}`
  },
  titleContainer: {
    paddingBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  listItemText: {
    margin: 0,
    padding: "10px 4px",
    cursor: "pointer",
    transition: ".3s all ease",
    "&:hover": {
      backgroundColor: theme.palette.grey[100]
    }
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
  }
}));

export function DeploymentListRow({ deployment, isSelectable, onSelectDeployment, checked, providers }) {
  const classes = useStyles();
  const history = useHistory();
  const { getDeploymentName } = useLocalNotes();
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
    <ListItem classes={{ root: classes.root }}>
      <ListItemIcon>
        {deployment.state === "active" && <CloudIcon color="primary" />}
        {deployment.state === "closed" && <CancelPresentationIcon color="disabled" />}
      </ListItemIcon>
      <ListItemText
        className={classes.listItemText}
        onClick={viewDeployment}
        primaryTypographyProps={{ component: "div" }}
        primary={
          <Box component="span" display="flex" alignItems="center" marginBottom="2px">
            {deploymentName}
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
        }
        secondaryTypographyProps={{ component: "div" }}
        secondary={
          <>
            <Box display="flex" alignItems="center" marginBottom="4px">
              <SpecDetail
                cpuAmount={deployment.cpuAmount}
                memoryAmount={deployment.memoryAmount}
                storageAmount={deployment.storageAmount}
                size="small"
                color={deployment.state === "active" ? "primary" : "default"}
                gutterSize="small"
              />
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
          </>
        }
      />
      <ListItemSecondaryAction>
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
      </ListItemSecondaryAction>
    </ListItem>
  );
}
