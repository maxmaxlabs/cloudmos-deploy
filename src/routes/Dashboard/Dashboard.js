import CloudIcon from "@material-ui/icons/Cloud";
import AddIcon from "@material-ui/icons/Add";
import MemoryIcon from "@material-ui/icons/Memory";
import StorageIcon from "@material-ui/icons/Storage";
import SpeedIcon from "@material-ui/icons/Speed";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { makeStyles, IconButton, Box, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, Typography, Button } from "@material-ui/core";
import { humanFileSize } from "../../shared/utils/unitUtils";
import { useHistory } from "react-router";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { Helmet } from "react-helmet-async";
import { DeploymentListRow } from "../DeploymentList/DeploymentListRow";

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
  noActiveDeployments: {
    marginBottom: "1rem"
  }
}));

export function Dashboard({ deployments, isLoadingDeployments }) {
  const history = useHistory();
  const classes = useStyles();
  const orderedDeployments = deployments ? [...deployments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).filter((d) => d.state === "active") : [];

  function createDeployment() {
    history.push("/createDeployment");
  }

  function viewDeployment(deployment) {
    history.push("/deployment/" + deployment.dseq);
  }

  return (
    <>
      <Helmet title="Dashboard" />
      <LinearLoadingSkeleton isLoading={isLoadingDeployments} />
      <Box className={classes.root}>
        <Box className={classes.titleContainer}>
          <Typography variant="h3" className={classes.title}>
            Active Deployments
          </Typography>
        </Box>
        <Box>
          {orderedDeployments.length > 0 ? (
            orderedDeployments.map((deployment) => (
              <DeploymentListRow key={deployment.dseq} deployment={deployment} />
            ))
          ) : (
            <Box textAlign="center" padding="4rem">
              <Typography variant="h5" className={classes.noActiveDeployments}>
                No active deployments
              </Typography>
              <Button variant="contained" size="medium" color="primary" onClick={() => createDeployment()}>
                <AddIcon />
                &nbsp;Create Deployment
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
