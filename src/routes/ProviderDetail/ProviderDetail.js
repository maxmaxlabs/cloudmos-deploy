import { useState, useEffect } from "react";
import { makeStyles, IconButton, Typography, Box, Paper } from "@material-ui/core";
import { useProviderDetail } from "../../queries";
import { ProviderSummary } from "../Providers/ProviderSummary";
import { Helmet } from "react-helmet-async";
import { useParams, useHistory } from "react-router-dom";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { LeaseList } from "./LeaseList";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiPagination-ul": {
      justifyContent: "center"
    }
  },
  titleContainer: {
    padding: ".5rem 1rem",
    display: "flex",
    alignItems: "center"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginLeft: ".5rem"
  },
  content: {
    padding: "0 1rem"
  },
  summaryContainer: {
    padding: ".5rem"
  }
}));

export function ProviderDetail({ providers, leases, getLeases, isLoadingLeases, dataNodeProviders, isLoadingDataNodeProviders, getDataNodeProviders }) {
  const classes = useStyles();
  const [provider, setProvider] = useState(null);
  const [filteredLeases, setFilteredLeases] = useState(null);
  const history = useHistory();
  const { owner } = useParams();
  const {
    data: providerDetail,
    isFetching: isLoadingProvider,
    refetch: getProviderDetail
  } = useProviderDetail(owner, { refetchOnMount: false, enabled: false });

  useEffect(() => {
    const providerFromList = providers?.find((d) => d.owner === owner);
    if (providerFromList && dataNodeProviders) {
      // TODO Once data-node provider endpoint it finalized, only use data node provider
      const dataNodeProvider = dataNodeProviders.find((x) => x.owner === providerFromList.owner);
      const _provider = {
        ...providerFromList,
        ...dataNodeProvider,
        isActive: true
      };
      setProvider(_provider);
    } else {
      loadProviderDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (providerDetail && dataNodeProviders) {
      // TODO Once data-node provider endpoint it finalized, only use data node provider
      const dataNodeProvider = dataNodeProviders.find((x) => x.owner === providerDetail.owner);
      const _provider = {
        ...providerDetail,
        ...dataNodeProvider,
        isActive: true
      };
      setProvider(_provider);
    }
  }, [providerDetail, dataNodeProviders]);

  useEffect(() => {
    if (provider && leases && leases.length > 0) {
      const _leases = leases?.filter((d) => d.provider === provider.owner);
      setFilteredLeases(_leases);
    }
  }, [leases, provider]);

  function loadProviderDetail() {
    if (!isLoadingProvider) {
      getProviderDetail();
      getLeases();
      getDataNodeProviders();
    }
  }

  function handleBackClick() {
    history.goBack();
  }

  return (
    <div className={classes.root}>
      <Helmet title="Provider Detail" />

      <LinearLoadingSkeleton isLoading={isLoadingLeases || isLoadingProvider || isLoadingDataNodeProviders} />

      <div className={classes.titleContainer}>
        <Box display="flex" alignItems="center">
          <IconButton aria-label="back" onClick={handleBackClick} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h3" className={classes.title}>
            Provider detail
          </Typography>
        </Box>
      </div>

      {provider && (
        <div className={classes.content}>
          <Paper elevation={1} className={classes.summaryContainer}>
            <ProviderSummary provider={provider} leases={leases} />
          </Paper>

          <LeaseList isLoadingLeases={isLoadingLeases} leases={filteredLeases} />
        </div>
      )}
    </div>
  );
}
