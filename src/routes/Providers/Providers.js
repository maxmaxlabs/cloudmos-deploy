import { useState, useEffect } from "react";
import { Box, makeStyles, Typography, IconButton, Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import RefreshIcon from "@material-ui/icons/Refresh";
import Pagination from "@material-ui/lab/Pagination";
import { useSettings } from "../../context/SettingsProvider";
import { ProviderCard } from "./ProviderCard";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { useAkash } from "../../context/AkashProvider";

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
  checkbox: {
    padding: "4px"
  }
}));

export function Providers({ leases, isLoadingLeases, getLeases }) {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [isFilteringActive, setIsFilteringActive] = useState(true);
  const [isFilteringFavorites, setIsFilteringFavorites] = useState(false);
  const [isFilteringAudited, setIsFilteringAudited] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const { settings } = useSettings();
  const { favoriteProviders } = useLocalNotes();
  const { apiEndpoint } = settings;
  const { providers, isLoadingProviders, getProviders } = useAkash();
  const rowsPerPage = 12;
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentPageProviders = filteredProviders.slice(start, end);
  const pageCount = Math.ceil(filteredProviders.length / rowsPerPage);

  useEffect(() => {
    getProviders();
    getLeases();

    if (favoriteProviders.length > 0) {
      setIsFilteringFavorites(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  useEffect(() => {
    if (providers) {
      let filteredProviders = [...providers];

      if (isFilteringActive) {
        filteredProviders = filteredProviders.filter((x) => x.isActive);
      }

      if (isFilteringFavorites) {
        filteredProviders = filteredProviders.filter((x) => favoriteProviders.some((y) => y === x.owner));
      }

      if (isFilteringAudited) {
        filteredProviders = filteredProviders.filter((x) => x.isAudited);
      }

      setFilteredProviders(filteredProviders);
    }
  }, [providers, isFilteringActive, isFilteringFavorites, isFilteringAudited, favoriteProviders]);

  const refresh = () => {
    getProviders();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const onIsFilteringActiveClick = (ev, value) => {
    setPage(1);
    setIsFilteringActive(value);
  };

  const onIsFilteringFavoritesClick = (ev, value) => {
    setPage(1);
    setIsFilteringFavorites(value);
  };

  const onIsFilteringAuditedClick = (ev, value) => {
    setPage(1);
    setIsFilteringAudited(value);
  };

  return (
    <>
      <Helmet title="Providers" />

      <LinearLoadingSkeleton isLoading={isLoadingProviders || isLoadingLeases} />
      <Box className={classes.root}>
        <Box className={classes.titleContainer}>
          <Typography variant="h3" className={classes.title}>
            Providers
          </Typography>

          {providers && (
            <>
              <Box marginLeft="1rem">
                <IconButton aria-label="back" onClick={() => refresh()} size="small">
                  <RefreshIcon />
                </IconButton>
              </Box>

              <Box marginLeft="2rem">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFilteringActive}
                      onChange={onIsFilteringActiveClick}
                      color="primary"
                      size="small"
                      classes={{ root: classes.checkbox }}
                    />
                  }
                  label="Active"
                />
              </Box>
              <Box marginLeft="1rem">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFilteringFavorites}
                      onChange={onIsFilteringFavoritesClick}
                      color="primary"
                      size="small"
                      classes={{ root: classes.checkbox }}
                    />
                  }
                  label="Favorites"
                />
              </Box>
              <Box marginLeft="1rem">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFilteringAudited}
                      onChange={onIsFilteringAuditedClick}
                      color="primary"
                      size="small"
                      classes={{ root: classes.checkbox }}
                    />
                  }
                  label="Audited"
                />
              </Box>
            </>
          )}
        </Box>
        <Box padding="0 1rem">
          <Grid container spacing={2}>
            {currentPageProviders.map((provider) => (
              <ProviderCard key={provider.owner} provider={provider} leases={leases} />
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
