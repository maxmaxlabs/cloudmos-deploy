import { useEffect, useState } from "react";
import { makeStyles, Button, Box, Typography, IconButton } from "@material-ui/core";
import { useHistory } from "react-router";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { Helmet } from "react-helmet-async";
import { DeploymentListRow } from "./DeploymentListRow";
import Pagination from "@material-ui/lab/Pagination";
import RefreshIcon from "@material-ui/icons/Refresh";
import AddIcon from "@material-ui/icons/Add";

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
    alignItems: "center"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold"
  },
  createBtn: {
    marginLeft: "auto"
  }
}));

export function DeploymentList({ deployments, isLoadingDeployments, refreshDeployments }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    refreshDeployments();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const orderedDeployments = deployments ? [...deployments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) : [];
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentPageDeployments = deployments.slice(start, end);
  const pageCount = Math.ceil(orderedDeployments.length / rowsPerPage);

  function createDeployment() {
    history.push("/createDeployment");
  }
  console.log(page, rowsPerPage, pageCount, orderedDeployments.length / rowsPerPage);
  return (
    <>
      <Helmet title="Deployment List" />

      <LinearLoadingSkeleton isLoading={isLoadingDeployments} />
      <Box className={classes.root}>
        <Box className={classes.titleContainer}>
          <Typography variant="h3" className={classes.title}>
            Deployments
          </Typography>

          <Box marginLeft="1rem">
            <IconButton aria-label="back" onClick={refreshDeployments}>
              <RefreshIcon />
            </IconButton>
          </Box>

          <Button className={classes.createBtn} variant="contained" size="medium" color="primary" onClick={() => createDeployment()}>
            <AddIcon />
            &nbsp;Create Deployment
          </Button>
        </Box>
        <Box>
          {currentPageDeployments.map((deployment) => (
            <DeploymentListRow key={deployment.dseq} deployment={deployment} />
          ))}
        </Box>
        <Box mt={2}>
          <Pagination count={pageCount} onChange={handleChangePage} page={page} size="large" />
        </Box>
      </Box>
    </>
  );
}
