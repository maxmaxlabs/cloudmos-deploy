import AddIcon from "@material-ui/icons/Add";
import { makeStyles, Button, Box, Typography } from "@material-ui/core";
import { useHistory } from "react-router";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { Helmet } from "react-helmet-async";
import { DeploymentListRow } from "./DeploymentListRow";

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
  }
}));

export function DeploymentList({ deployments, isLoadingDeployments }) {
  const classes = useStyles();
  const history = useHistory();
  
  const orderedDeployments = deployments ? [...deployments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) : [];

  function createDeployment() {
    history.push("/createDeployment");
  }

  return (
    <>
      <Helmet title="Deployment List" />

      <LinearLoadingSkeleton isLoading={isLoadingDeployments} />
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
          {orderedDeployments.map((deployment) => (
            <DeploymentListRow key={deployment.dseq} deployment={deployment} />
          ))}
        </Box>
      </Box>
    </>
  );
}
