import { useState, useEffect } from "react";
import { Box, makeStyles, Typography, IconButton, Grid } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import { useProviders } from "../../queries";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import RefreshIcon from "@material-ui/icons/Refresh";
import Pagination from "@material-ui/lab/Pagination";
import { useSettings } from "../../context/SettingsProvider";
import { ProviderCard } from "./ProviderCard";

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
  }
}));

export function Providers({}) {
  const classes = useStyles();
  const { data: providers, isFetching: isFetchingProviders, refetch } = useProviders({ enabled: false });
  const [page, setPage] = useState(1);
  const { settings } = useSettings();
  const { apiEndpoint } = settings;
  const rowsPerPage = 12;
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const orderedProviders = providers ? [...providers].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)) : [];
  const currentPageProviders = orderedProviders.slice(start, end);
  const pageCount = Math.ceil(orderedProviders.length / rowsPerPage);

  useEffect(() => {
    refetch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <>
      <Helmet title="Providers" />

      <LinearLoadingSkeleton isLoading={isFetchingProviders} />
      <Box className={classes.root}>
        <Box className={classes.titleContainer}>
          <Typography variant="h3" className={classes.title}>
            Providers
          </Typography>

          <Box marginLeft="1rem">
            <IconButton aria-label="back" onClick={() => refetch()} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        <Box padding="1rem">
          <Grid container spacing={1}>
            {currentPageProviders.map((provider) => (
              <ProviderCard key={provider.owner} provider={provider} />
            ))}
          </Grid>
        </Box>

        <Box padding="1rem 1rem 2rem">
          <Pagination count={pageCount} onChange={handleChangePage} page={page} size="large" />
        </Box>
      </Box>
    </>
  );
}
