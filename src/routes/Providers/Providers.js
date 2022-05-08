import { useState, useEffect } from "react";
import { Box, makeStyles, Typography, IconButton, Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import RefreshIcon from "@material-ui/icons/Refresh";
import Pagination from "@material-ui/lab/Pagination";
import { useSettings } from "../../context/SettingsProvider";
import { ProviderCard } from "./ProviderCard";
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
  }
}));

export function Providers({
  providers,
  isLoadingProviders,
  getProviders,
  leases,
  isLoadingLeases,
  getLeases,
  dataNodeProviders,
  isLoadingDataNodeProviders,
  getDataNodeProviders
}) {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [isFilteringActive, setIsFilteringActive] = useState(true);
  const [isFilteringFavorites, setIsFilteringFavorites] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState([]);
  // const { data: auditors, isFetching: isFetchingAuditors, refetch: getAuditors } = useAuditors({ enabled: false });
  const { settings } = useSettings();
  const { favoriteProviders } = useLocalNotes();
  const { apiEndpoint } = settings;
  const rowsPerPage = 12;
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentPageProviders = filteredProviders.slice(start, end);
  const pageCount = Math.ceil(filteredProviders.length / rowsPerPage);

  useEffect(() => {
    getProviders();
    getDataNodeProviders();
    getLeases();
    // getAuditors();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  useEffect(() => {
    if (providers && dataNodeProviders) {
      // TODO Once data-node provider endpoint it finalized, only use data node provider
      let filteredProviders = providers.map((provider) => {
        const dataNodeProvider = dataNodeProviders.find((x) => x.owner === provider.owner);

        if (dataNodeProvider) {
          // Merge the data from akash node + data node
          return {
            ...provider,
            ...dataNodeProvider,
            isActive: true
          };
        } else {
          return provider;
        }
      });

      if (isFilteringActive) {
        filteredProviders = filteredProviders.filter((x) => x.isActive);
      }

      if (isFilteringFavorites) {
        filteredProviders = filteredProviders.filter((x) => favoriteProviders.some((y) => y === x.owner));
      }

      setFilteredProviders(filteredProviders);
    }
  }, [providers, dataNodeProviders, isFilteringActive, isFilteringFavorites, favoriteProviders]);

  const refresh = () => {
    getProviders();
    getDataNodeProviders();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <>
      <Helmet title="Providers" />

      <LinearLoadingSkeleton isLoading={isLoadingProviders || isLoadingDataNodeProviders || isLoadingLeases} />
      <Box className={classes.root}>
        <Box className={classes.titleContainer}>
          <Typography variant="h3" className={classes.title}>
            Providers
          </Typography>

          <Box marginLeft="1rem">
            <IconButton aria-label="back" onClick={() => refresh()} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>

          <Box marginLeft="1rem">
            <FormControlLabel
              control={<Checkbox checked={isFilteringActive} onChange={(ev, value) => setIsFilteringActive(value)} color="primary" />}
              label="Active"
            />
          </Box>
          <Box marginLeft="1rem">
            <FormControlLabel
              control={<Checkbox checked={isFilteringFavorites} onChange={(ev, value) => setIsFilteringFavorites(value)} color="primary" />}
              label="Favorites"
            />
          </Box>
        </Box>
        <Box padding="0 1rem">
          <Grid container spacing={2}>
            {currentPageProviders.map((provider) => (
              <ProviderCard
                key={provider.owner}
                provider={provider}
                leases={leases}
              />
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
