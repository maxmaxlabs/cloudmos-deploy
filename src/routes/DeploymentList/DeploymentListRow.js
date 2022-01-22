import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import CloudIcon from "@material-ui/icons/Cloud";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import {
  makeStyles,
  IconButton,
  Box,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  Chip,
  CircularProgress
} from "@material-ui/core";
import { useHistory } from "react-router";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { useLeaseList } from "../../queries";
import { useWallet } from "../../context/WalletProvider";
import { StatusPill } from "../../shared/components/StatusPill";
import { SpecDetail } from "../../shared/components/SpecDetail";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem",
    "& .MuiListItemText-secondary .MuiSvgIcon-root:not(:first-child)": {
      marginLeft: "5px"
    }
  },
  titleContainer: {
    paddingBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
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
  }
}));

export function DeploymentListRow({ deployment }) {
  const classes = useStyles();
  const history = useHistory();
  const { getDeploymentName } = useLocalNotes();
  const { address } = useWallet();
  const { data: leases, isLoading: isLoadingLeases } = useLeaseList(deployment, address, { enabled: !!deployment && deployment.state === "active" });

  function viewDeployment(deployment) {
    history.push("/deployment/" + deployment.dseq);
  }

  const name = getDeploymentName(deployment.dseq);

  return (
    <ListItem key={deployment.dseq} button onClick={() => viewDeployment(deployment)}>
      <ListItemIcon>
        {deployment.state === "active" && <CloudIcon color="primary" />}
        {deployment.state === "closed" && <CancelPresentationIcon />}
      </ListItemIcon>
      <ListItemText
        primary={
          name ? (
            <>
              <strong>{name}</strong>
              <Typography className={classes.dseq}> - {deployment.dseq}</Typography>
            </>
          ) : (
            deployment.dseq
          )
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

            {leases && !!leases.length && (
              <Box display="flex" alignItems="center">
                Leases:{" "}
                {leases?.map((lease) => (
                  <Chip
                    key={lease.id}
                    size="small"
                    className={classes.leaseChip}
                    label={
                      <>
                        <span>GSEQ: {lease.gseq}</span>
                        <Box component="span" marginLeft=".5rem">
                          OSEQ: {lease.oseq}
                        </Box>
                        <Box component="span" marginLeft=".5rem">
                          Status: {lease.state}
                        </Box>
                      </>
                    }
                    icon={<StatusPill state={lease.state} size="small" />}
                  />
                ))}
              </Box>
            )}

            {isLoadingLeases && <CircularProgress size="1rem" />}
          </>
        }
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={() => viewDeployment(deployment)}>
          <ChevronRightIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
