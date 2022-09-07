import { useState, useEffect } from "react";
import {
  Box,
  makeStyles,
  Typography,
  IconButton,
  Grid,
  FormControlLabel,
  Checkbox,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import RefreshIcon from "@material-ui/icons/Refresh";
import Pagination from "@material-ui/lab/Pagination";
import { useSettings } from "../../context/SettingsProvider";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { useAkash } from "../../context/AkashProvider";
import CloseIcon from "@material-ui/icons/Close";
import { ProviderSummary } from "./ProviderSummary";

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
  },
  selectLabel: {
    top: "-6px",
    left: "14px"
  },
  selectFormControl: {
    flexBasis: "150px",
    marginLeft: "1rem"
  }
}));

const sortOptions = [
  { id: 1, title: "Active Leases (desc)" },
  { id: 2, title: "Active Leases (asc)" },
  { id: 3, title: "Your Leases (desc)" },
  { id: 4, title: "Your Active Leases (desc)" }
];

export function Providers({ leases, isLoadingLeases, getLeases }) {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [isFilteringActive, setIsFilteringActive] = useState(true);
  const [isFilteringFavorites, setIsFilteringFavorites] = useState(false);
  const [isFilteringAudited, setIsFilteringAudited] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [sort, setSort] = useState(1);
  const [search, setSearch] = useState("");
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
      let filteredProviders = [...providers].map((p) => {
        const numberOfDeployments = leases?.filter((d) => d.provider === p.owner).length || 0;
        const numberOfActiveLeases = leases?.filter((d) => d.provider === p.owner && d.state === "active").length || 0;

        return {
          ...p,
          userLeases: numberOfDeployments,
          userActiveLeases: numberOfActiveLeases
        };
      });

      // Filter for search
      if (search) {
        filteredProviders = filteredProviders.filter((x) => x.hostUri?.includes(search.toLowerCase()));
      }

      if (isFilteringActive) {
        filteredProviders = filteredProviders.filter((x) => x.isActive);
      }

      if (isFilteringFavorites) {
        filteredProviders = filteredProviders.filter((x) => favoriteProviders.some((y) => y === x.owner));
      }

      if (isFilteringAudited) {
        filteredProviders = filteredProviders.filter((x) => x.isAudited);
      }

      filteredProviders = filteredProviders.sort((a, b) => {
        if (sort === 1) {
          return b.leaseCount - a.leaseCount;
        } else if (sort === 2) {
          return a.leaseCount - b.leaseCount;
        } else if (sort === 3) {
          return b.userLeases - a.userLeases;
        } else if (sort === 4) {
          return b.userActiveLeases - a.userActiveLeases;
        } else {
          return true;
        }
      });

      setFilteredProviders(filteredProviders);
    }
  }, [providers, isFilteringActive, isFilteringFavorites, isFilteringAudited, favoriteProviders, search, sort, leases]);

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

  const onSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
  };

  const handleSortChange = (event) => {
    const value = event.target.value;

    setSort(value);
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

        <Box padding=".5rem 1rem 1rem" display="flex" alignItems="center">
          <TextField
            label="Search Providers"
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

          <FormControl className={classes.selectFormControl}>
            <InputLabel id="sort-select-label" className={classes.selectLabel}>
              Sort by
            </InputLabel>
            <Select
              labelId="sort-select-label"
              label="Sort by"
              value={sort}
              onChange={handleSortChange}
              variant="outlined"
              classes={{
                selectMenu: classes.menuRoot
              }}
            >
              {sortOptions.map((l) => (
                <MenuItem key={l.id} value={l.id} size="small">
                  <Typography variant="caption" className={classes.selectItem}>
                    {l.title}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box padding="0 1rem">
          <Grid container spacing={2}>
            {currentPageProviders.map((provider) => (
              <Grid item xs={12} key={provider.owner}>
                <ProviderSummary provider={provider} leases={leases} canViewDetail />
              </Grid>
            ))}
          </Grid>
        </Box>

        {search && currentPageProviders.length === 0 && (
          <Box padding="1rem">
            <Typography>No provider found.</Typography>
          </Box>
        )}

        <Box padding="1rem 1rem 2rem">
          <Pagination count={pageCount} onChange={handleChangePage} page={page} size="large" />
        </Box>
      </Box>
    </>
  );
}
