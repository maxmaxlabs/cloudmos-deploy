import React, { useState, useEffect } from "react";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  LinearProgress,
  Menu,
  MenuItem,
  IconButton,
  makeStyles,
  TextField,
  InputAdornment
} from "@material-ui/core";
import { useWallet } from "../../context/WalletProvider";
import { BidGroup } from "./BidGroup";
import { useHistory } from "react-router";
import { sendManifestToProvider, Manifest } from "../../shared/utils/deploymentUtils";
import { useCertificate } from "../../context/CertificateProvider";
import { getDeploymentLocalData } from "../../shared/utils/deploymentLocalDataUtils";
import { useTransactionModal } from "../../context/TransactionModal";
import { UrlService } from "../../shared/utils/urlUtils";
import { useBidList } from "../../queries";
import { useSnackbar } from "notistack";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Alert from "@material-ui/lab/Alert";
import { Helmet } from "react-helmet-async";
import { analytics } from "../../shared/utils/analyticsUtils";
import { useProviders } from "../../queries";
import CloseIcon from "@material-ui/icons/Close";
import { ManifestErrorSnackbar } from "../../shared/components/ManifestErrorSnackbar";

const yaml = require("js-yaml");

const useStyles = makeStyles((theme) => ({
  root: {},
  alert: {
    marginBottom: "1rem"
  },
  title: {
    fontSize: "1.5rem"
  }
}));

// Refresh bids every 7 seconds;
const REFRESH_BIDS_INTERVAL = 7000;
// Request every 7 seconds to a max of 5 minutes before deployments closes
const MAX_NUM_OF_BID_REQUESTS = Math.floor((5 * 60 * 1000) / REFRESH_BIDS_INTERVAL);
// Show a warning after 1 minute
const WARNING_NUM_OF_BID_REQUESTS = Math.round((60 * 1000) / REFRESH_BIDS_INTERVAL);

export function CreateLease({ dseq }) {
  const [isSendingManifest, setIsSendingManifest] = useState(false);
  const [selectedBids, setSelectedBids] = useState({});
  const [filteredBids, setFilteredBids] = useState([]);
  const [search, setSearch] = useState("");
  const { sendTransaction } = useTransactionModal();
  const { address } = useWallet();
  const { localCert } = useCertificate();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const { data: providers } = useProviders();
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const [numberOfRequests, setNumberOfRequests] = useState(0);
  const warningRequestsReached = numberOfRequests > WARNING_NUM_OF_BID_REQUESTS;
  const maxRequestsReached = numberOfRequests > MAX_NUM_OF_BID_REQUESTS;
  const { data: bids, isLoading: isLoadingBids } = useBidList(address, dseq, {
    initialData: [],
    refetchInterval: REFRESH_BIDS_INTERVAL,
    onSuccess: (bids) => {
      setNumberOfRequests((prev) => ++prev);
    },
    enabled: !maxRequestsReached
  });
  const groupedBids = bids
    .sort((a, b) => a.price.amount - b.price.amount)
    .reduce((a, b) => {
      a[b.gseq] = [...(a[b.gseq] || []), b];
      return a;
    }, {});
  const dseqList = Object.keys(groupedBids);
  const allClosed = bids.length > 0 && bids.every((bid) => bid.state === "closed");

  // Filter bids by search
  useEffect(() => {
    if (search) {
      const fBids = [];

      bids?.forEach((bid) => {
        const provider = providers.find((p) => p.owner === bid.provider);

        // Filter by attribute value
        provider?.attributes.forEach((att) => {
          if (att.value?.includes(search)) {
            fBids.push(bid.id);
          }
        });
      });

      setFilteredBids(fBids);
    } else {
      setFilteredBids(bids?.map((b) => b.id) || []);
    }
  }, [search, bids, providers]);

  const handleBidSelected = (bid) => {
    setSelectedBids({ ...selectedBids, [bid.gseq]: bid });
  };

  async function sendManifest(providerInfo, manifest) {
    try {
      const response = await sendManifestToProvider(providerInfo, manifest, dseq, localCert);

      return response;
    } catch (err) {
      enqueueSnackbar(<ManifestErrorSnackbar err={err} />, { variant: "error", autoHideDuration: null });
      throw err;
    }
  }

  async function handleNext() {
    console.log("Accepting bids...");

    // Create the lease
    try {
      const messages = Object.keys(selectedBids)
        .map((gseq) => selectedBids[gseq])
        .map((bid) => TransactionMessageData.getCreateLeaseMsg(bid));
      const response = await sendTransaction(messages);

      if (!response) throw new Error("Rejected transaction");

      await analytics.event("deploy", "create lease");
    } catch (error) {
      throw error;
    }

    setIsSendingManifest(true);

    const deploymentData = getDeploymentLocalData(dseq);
    if (deploymentData && deploymentData.manifest) {
      // Send the manifest
      try {
        const provider = providers.find((x) => x.owner === selectedBids[Object.keys(selectedBids)[0]].provider);
        const yamlJson = yaml.load(deploymentData.manifest);
        const mani = Manifest(yamlJson);

        await sendManifest(provider, mani);
      } catch (err) {
        console.error(err);
      }
    }

    setIsSendingManifest(false);

    await analytics.event("deploy", "send manifest");

    history.replace(UrlService.deploymentDetails(dseq));
  }

  async function handleCloseDeployment() {
    try {
      const message = TransactionMessageData.getCloseDeploymentMsg(address, dseq);
      const response = await sendTransaction([message]);

      if (response) {
        history.replace(UrlService.deploymentList());
      }
    } catch (error) {
      throw error;
    }
  }

  function handleMenuClick(ev) {
    setAnchorEl(ev.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
  };

  return (
    <>
      <Helmet title="Create Deployment - Create Lease" />

      {isSendingManifest && (
        <Box marginBottom=".5rem">
          <LinearProgress />
        </Box>
      )}

      {(isLoadingBids || bids.length === 0) && !maxRequestsReached && (
        <Box textAlign="center">
          <CircularProgress />
          <Box paddingTop="1rem">
            <Typography variant="body1">Waiting for bids...</Typography>
          </Box>
        </Box>
      )}

      {warningRequestsReached && !maxRequestsReached && bids.length === 0 && (
        <Box padding="1rem">
          <Alert variant="standard" severity="info">
            There should be bids by now... You can wait longer in case a bid shows up or close the deployment and try again with a different configuration.
          </Alert>
        </Box>
      )}

      {maxRequestsReached && bids.length === 0 && (
        <Box padding="1rem">
          <Alert variant="standard" severity="warning">
            There's no bid for the current deployment. You can close the deployment and try again with a different configuration.
          </Alert>
        </Box>
      )}

      {!isLoadingBids && bids.length > 0 && (
        <Box display="flex" justifyContent="space-between" marginBottom="1rem">
          <Typography variant="h3" className={classes.title}>
            Choose a provider:
          </Typography>
          <TextField
            label="Search by attribute..."
            disabled={bids.length === 0}
            value={search}
            onChange={onSearchChange}
            type="text"
            variant="outlined"
            autoFocus
            size="small"
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
      )}

      {dseqList.map((gseq) => (
        <BidGroup
          key={gseq}
          gseq={gseq}
          bids={groupedBids[gseq]}
          handleBidSelected={handleBidSelected}
          selectedBid={selectedBids[gseq]}
          disabled={isSendingManifest}
          providers={providers}
          filteredBids={filteredBids}
        />
      ))}

      {!isLoadingBids && bids.length > 0 && !allClosed && (
        <Box mt={1}>
          <Alert severity="info" className={classes.alert}>
            Bids automatically close 5 minutes after the deployment is created if none are selected for a lease.
          </Alert>

          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={dseqList.some((gseq) => !selectedBids[gseq]) || isSendingManifest || !providers}
          >
            Accept Bid{dseqList.length > 1 ? "s" : ""}
          </Button>

          <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="bid-actions-menu"
            anchorEl={anchorEl}
            keepMounted
            getContentAnchorEl={null}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right"
            }}
            onClick={handleMenuClose}
          >
            <MenuItem onClick={() => handleCloseDeployment()}>Close Deployment</MenuItem>
          </Menu>
        </Box>
      )}
      <>
        {!isLoadingBids && allClosed && (
          <Alert severity="warning">
            All bids for this deployment are closed. This can happen if no bids are accepted for more than 5 minutes after the deployment creation. You can
            close this deployment and create a new one.
          </Alert>
        )}
        {!isLoadingBids && (allClosed || bids.length === 0) && (
          <Box mt={1}>
            <Button variant="contained" color={allClosed ? "primary" : "secondary"} onClick={handleCloseDeployment}>
              Close Deployment
            </Button>
          </Box>
        )}
      </>
    </>
  );
}
