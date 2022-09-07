import { useEffect, useState } from "react";
import { makeStyles, Button, Box, Typography, IconButton, TextField, InputAdornment } from "@material-ui/core";
import { Link } from "react-router-dom";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { Helmet } from "react-helmet-async";
import { DeploymentListRow } from "./DeploymentListRow";
import Pagination from "@material-ui/lab/Pagination";
import RefreshIcon from "@material-ui/icons/Refresh";
import AddIcon from "@material-ui/icons/Add";
import { useSettings } from "../../context/SettingsProvider";
import CloseIcon from "@material-ui/icons/Close";
import { useLocalNotes } from "../../context/LocalNoteProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiPagination-ul": {
      justifyContent: "center"
    }
  },
  titleContainer: {
    padding: "0.5rem 1rem",
    display: "flex",
    alignItems: "center"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold"
  },
  createBtn: {
    marginLeft: "auto"
  }
}));

export function DeploymentList({ deployments, isLoadingDeployments, refreshDeployments }) {
  const [page, setPage] = useState(1);
  const classes = useStyles();
  const { settings } = useSettings();
  const [search, setSearch] = useState("");
  const { getDeploymentName } = useLocalNotes();
  const [filteredDeployments, setFilteredDeployments] = useState([]);
  const { apiEndpoint } = settings;
  const rowsPerPage = 10;
  const orderedDeployments = filteredDeployments ? [...filteredDeployments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) : [];
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentPageDeployments = orderedDeployments.slice(start, end);
  const pageCount = Math.ceil(orderedDeployments.length / rowsPerPage);

  useEffect(() => {
    refreshDeployments();
  }, [refreshDeployments, apiEndpoint]);

  useEffect(() => {
    if (deployments) {
      let filteredDeployments = deployments.map((d) => {
        const name = getDeploymentName(d.dseq);

        return {
          ...d,
          name
        };
      });

      // Filter for search
      if (search) {
        filteredDeployments = filteredDeployments.filter((x) => x.name?.toLowerCase().includes(search.toLowerCase()));
      }

      setFilteredDeployments(filteredDeployments);
    }
  }, [deployments, search, getDeploymentName]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const onSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
  };

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
            <IconButton aria-label="back" onClick={refreshDeployments} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>

          <Button className={classes.createBtn} variant="contained" size="medium" color="primary" component={Link} to="/createDeployment">
            <AddIcon />
            &nbsp;Create Deployment
          </Button>
        </Box>

        <Box padding=".5rem 1rem 1rem" display="flex" alignItems="center">
          <TextField
            label="Search Deployments by name"
            value={search}
            onChange={onSearchChange}
            type="text"
            variant="outlined"
            autoFocus
            fullWidth
            size="medium"
            InputProps={{
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box>
          {currentPageDeployments.map((deployment) => (
            <DeploymentListRow key={deployment.dseq} deployment={deployment} refreshDeployments={refreshDeployments} />
          ))}
        </Box>

        {search && currentPageDeployments.length === 0 && (
          <Box padding="0 1rem">
            <Typography>No deployment found.</Typography>
          </Box>
        )}
        <Box padding="1rem 1rem 2rem">
          <Pagination count={pageCount} onChange={handleChangePage} page={page} size="large" />
        </Box>
      </Box>
    </>
  );
}
