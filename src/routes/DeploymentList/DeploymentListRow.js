import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import CloudIcon from "@material-ui/icons/Cloud";
import MemoryIcon from "@material-ui/icons/Memory";
import StorageIcon from "@material-ui/icons/Storage";
import SpeedIcon from "@material-ui/icons/Speed";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { makeStyles, IconButton, Box, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, Typography } from "@material-ui/core";
import { useHistory } from "react-router";
import { humanFileSize } from "../../shared/utils/unitUtils";
import { useLocalNotes } from "../../context/LocalNoteProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem",
    "& .MuiListItemText-secondary .MuiSvgIcon-root:not(:first-child)": {
      marginLeft: "5px"
    },
    "& .MuiListItemText-secondary .MuiSvgIcon-root": {
      fontSize: "20px"
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
  }
}));

export function DeploymentListRow({ deployment }) {
  const classes = useStyles();
  const history = useHistory();
  const { getDeploymentName } = useLocalNotes();

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
        secondary={
          <Box component="span" display="flex" alignItems="center">
            <SpeedIcon />
            {deployment.cpuAmount + "vcpu"}
            <MemoryIcon title="Memory" />
            {humanFileSize(deployment.memoryAmount)}
            <StorageIcon />
            {humanFileSize(deployment.storageAmount)}
          </Box>
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
