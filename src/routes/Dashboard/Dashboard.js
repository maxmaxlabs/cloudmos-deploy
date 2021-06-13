import { useState, useEffect } from "react";
import { apiEndpoint } from "../../shared/constants";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import CloudIcon from "@material-ui/icons/Cloud";
import AddIcon from "@material-ui/icons/Add";
import MemoryIcon from "@material-ui/icons/Memory";
import StorageIcon from "@material-ui/icons/Storage";
import SpeedIcon from "@material-ui/icons/Speed";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import {
  makeStyles,
  Button,
  CircularProgress,
  IconButton,
  Box,
  Card,
  CardHeader,
  CardContent,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  LinearProgress
} from "@material-ui/core";
import { useHistory } from "react-router";
import { humanFileSize } from "../../shared/utils/unitUtils";
import { deploymentToDto } from "../../shared/utils/deploymentDetailUtils";
import { useWallet } from "../../context/WalletProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "10px",
    "& .MuiListItemText-secondary .MuiSvgIcon-root:not(:first-child)": {
      marginLeft: "5px"
    },
    "& .MuiListItemText-secondary .MuiSvgIcon-root": {
      fontSize: "20px"
    }
  },
  titleContainer: {
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold"
  },
  loadingSkeleton: {
    height: "4px",
    width: "100%"
  }
}));

export function DeploymentList(props) {
  const { deployments, setDeployments } = props;
  const classes = useStyles();
  const history = useHistory();
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(false);
  const { address, selectedWallet } = useWallet();

  useEffect(() => {
    loadDeployments(address);
  }, [address]);

  async function loadDeployments(address) {
    setIsLoadingDeployments(true);
    const response = await fetch(apiEndpoint + "/akash/deployment/v1beta1/deployments/list?filters.owner=" + address);
    let deployments = await response.json();

    setDeployments(deployments.deployments.map((d) => deploymentToDto(d)));

    setIsLoadingDeployments(false);
  }

  function createDeployment() {
    history.push("/createDeployment");
  }

  function viewDeployment(deployment) {
    history.push("/deployment/" + deployment.dseq);
  }

  const orderedDeployments = [...deployments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <Box className={classes.root}>
      <Box className={classes.titleContainer}>
        <Typography variant="h3" className={classes.title}>
          Deployments
        </Typography>

        <Button variant="contained" size="medium" color="primary" onClick={() => createDeployment()}>
          <AddIcon />
          &nbsp;Create Deployment
        </Button>
      </Box>
      <Box>
        {isLoadingDeployments ? <LinearProgress /> : <Box className={classes.loadingSkeleton} />}

        {orderedDeployments.map((deployment) => (
          <ListItem key={deployment.dseq} button onClick={() => viewDeployment(deployment)}>
            <ListItemIcon>
              {deployment.state === "active" && <CloudIcon />}
              {deployment.state === "closed" && <CancelPresentationIcon />}
            </ListItemIcon>
            <ListItemText
              primary={deployment.dseq}
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
        ))}
      </Box>
    </Box>
  );
}
