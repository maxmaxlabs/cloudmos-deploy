import React, { useState, useEffect } from "react";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  makeStyles,
  TextField,
  InputAdornment,
  Tooltip,
  FormControlLabel,
  Checkbox
} from "@material-ui/core";
import { useWallet } from "../../context/WalletProvider";
import { BidGroup } from "./BidGroup";
import { useHistory } from "react-router";
import { sendManifestToProvider } from "../../shared/utils/deploymentUtils";
import { deploymentData } from "../../shared/deploymentData";
import { useCertificate } from "../../context/CertificateProvider";
import { getDeploymentLocalData } from "../../shared/utils/deploymentLocalDataUtils";
import { useTransactionModal } from "../../context/TransactionModal";
import { UrlService } from "../../shared/utils/urlUtils";
import { useBidList, useDeploymentDetail } from "../../queries";
import { useAkash } from "../../context/AkashProvider";
import { useSnackbar } from "notistack";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import CloseIcon from "@material-ui/icons/Close";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForward";
import Alert from "@material-ui/lab/Alert";
import { Helmet } from "react-helmet-async";
import { analytics } from "../../shared/utils/analyticsUtils";
import { ManifestErrorSnackbar } from "../../shared/components/ManifestErrorSnackbar";
import { ViewPanel } from "../../shared/components/ViewPanel";
import InfoIcon from "@material-ui/icons/Info";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import clsx from "clsx";
import { Snackbar } from "../../shared/components/Snackbar";
import { useLocalNotes } from "../../context/LocalNoteProvider";

const yaml = require("js-yaml");

const useStyles = makeStyles((theme) => ({
  tooltip: {
    fontSize: "1rem",
    padding: ".5rem"
  },
  tooltipIcon: {
    fontSize: "1.5rem",
    color: theme.palette.text.secondary
  },
  marginLeft: {
    marginLeft: "1rem"
  },
  nowrap: {
    whiteSpace: "nowrap"
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
  const [isFilteringFavorites, setIsFilteringFavorites] = useState(false);
  const [isFilteringAudited, setIsFilteringAudited] = useState(true);
  const [selectedBids, setSelectedBids] = useState({});
  const [filteredBids, setFilteredBids] = useState([]);
  const [search, setSearch] = useState("");
  const { sendTransaction } = useTransactionModal();
  const { address } = useWallet();
  const { localCert } = useCertificate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const [numberOfRequests, setNumberOfRequests] = useState(0);
  const { providers, getProviders } = useAkash();
  const warningRequestsReached = numberOfRequests > WARNING_NUM_OF_BID_REQUESTS;
  const maxRequestsReached = numberOfRequests > MAX_NUM_OF_BID_REQUESTS;
  const { favoriteProviders } = useLocalNotes();
  const { data: bids, isLoading: isLoadingBids } = useBidList(address, dseq, {
    initialData: [],
    refetchInterval: REFRESH_BIDS_INTERVAL,
    onSuccess: () => {
      setNumberOfRequests((prev) => ++prev);
    },
    enabled: !maxRequestsReached
  });
  const { data: deploymentDetail, refetch: getDeploymentDetail } = useDeploymentDetail(address, dseq, { refetchOnMount: false, enabled: false });
  const groupedBids = bids
    .sort((a, b) => a.price.amount - b.price.amount)
    .reduce((a, b) => {
      a[b.gseq] = [...(a[b.gseq] || []), b];
      return a;
    }, {});
  const dseqList = Object.keys(groupedBids);
  const allClosed = bids.length > 0 && bids.every((bid) => bid.state === "closed");

  useEffect(() => {
    getDeploymentDetail();
    getProviders();

    if (favoriteProviders.length > 0) {
      setIsFilteringFavorites(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter bids by search
  useEffect(() => {
    let fBids = [];
    if ((search || isFilteringFavorites || isFilteringAudited) && providers) {
      bids?.forEach((bid) => {
        let isAdded = false;

        // Filter for search
        if (search) {
          const provider = providers.find((p) => p.owner === bid.provider);
          // Filter by attribute value
          provider?.attributes.forEach((att) => {
            if (att.value?.toLowerCase().includes(search.toLowerCase())) {
              fBids.push(bid.id);
              isAdded = true;
            }
          });
        }

        // Filter for favorites
        if (!isAdded && isFilteringFavorites) {
          const provider = favoriteProviders.find((p) => p === bid.provider);

          if (provider) {
            fBids.push(bid.id);
            isAdded = true;
          }
        }

        // Filter for audited
        if (!isAdded && isFilteringAudited) {
          const provider = providers.filter((x) => x.isAudited).find((p) => p.owner === bid.provider);

          if (provider) {
            fBids.push(bid.id);
          }
        }
      });
    } else {
      fBids = bids?.map((b) => b.id) || [];
    }

    setFilteredBids(fBids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, bids, providers, isFilteringFavorites, isFilteringAudited]);

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
    const bidKeys = Object.keys(selectedBids);

    // Create the lease
    try {
      const messages = bidKeys.map((gseq) => selectedBids[gseq]).map((bid) => TransactionMessageData.getCreateLeaseMsg(bid));
      const response = await sendTransaction(messages);

      if (!response) throw new Error("Rejected transaction");

      await analytics.event("deploy", "create lease");
    } catch (error) {
      // Rejected transaction
      return;
    }

    setIsSendingManifest(true);

    const localDeploymentData = getDeploymentLocalData(dseq);
    if (localDeploymentData && localDeploymentData.manifest) {
      // Send the manifest

      const sendManifestKey = enqueueSnackbar(<Snackbar title="Sending Manifest! 🚀" subTitle="Please wait a few seconds..." showLoading />, {
        variant: "success",
        autoHideDuration: null
      });

      try {
        const yamlJson = yaml.load(localDeploymentData.manifest);
        const mani = deploymentData.Manifest(yamlJson);

        for (let i = 0; i < bidKeys.length; i++) {
          const currentBid = selectedBids[bidKeys[i]];
          const provider = providers.find((x) => x.owner === currentBid.provider);
          await sendManifest(provider, mani);
        }
      } catch (err) {
        console.error(err);
      }

      closeSnackbar(sendManifestKey);
    }

    setIsSendingManifest(false);

    await analytics.event("deploy", "send manifest");

    history.replace(UrlService.deploymentDetails(dseq, "LOGS", "events"));
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

      <Box padding="0 1rem">
        {!isLoadingBids && bids.length > 0 && !allClosed && (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box flexGrow={1}>
              <TextField
                label="Search by attribute..."
                disabled={bids.length === 0 || isSendingManifest}
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

            <Box display="flex" alignItems="center">
              <Tooltip
                classes={{ tooltip: classes.tooltip }}
                arrow
                interactive
                title={
                  <Alert severity="info" variant="standard">
                    Bids automatically close 5 minutes after the deployment is created if none are selected for a lease.
                  </Alert>
                }
              >
                <InfoIcon className={clsx(classes.tooltipIcon, classes.marginLeft)} />
              </Tooltip>

              <Box margin="0 .5rem">
                <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick} size="small">
                  <MoreHorizIcon fontSize="large" />
                </IconButton>
              </Box>

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

              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                classes={{ label: classes.nowrap }}
                disabled={dseqList.some((gseq) => !selectedBids[gseq]) || isSendingManifest}
              >
                Accept Bid{dseqList.length > 1 ? "s" : ""}
                <Box component="span" marginLeft=".5rem" display="flex" alignItems="center">
                  <ArrowForwardIosIcon fontSize="small" />
                </Box>
              </Button>
            </Box>
          </Box>
        )}

        <Box display="flex" alignItems="center">
          {!isLoadingBids && (allClosed || bids.length === 0) && (
            <Button variant="contained" color={allClosed ? "primary" : "secondary"} onClick={handleCloseDeployment} size="small">
              Close Deployment
            </Button>
          )}

          {!isLoadingBids && allClosed && (
            <Tooltip
              classes={{ tooltip: classes.tooltip }}
              arrow
              interactive
              title={
                <Alert severity="warning">
                  All bids for this deployment are closed. This can happen if no bids are accepted for more than 5 minutes after the deployment creation. You
                  can close this deployment and create a new one.
                </Alert>
              }
            >
              <InfoIcon className={clsx(classes.tooltipIcon, classes.marginLeft)} color="error" />
            </Tooltip>
          )}
        </Box>

        {(isLoadingBids || bids.length === 0) && !maxRequestsReached && (
          <Box textAlign="center" paddingTop="1rem">
            <CircularProgress />
            <Box paddingTop="1rem">
              <Typography variant="body1">Waiting for bids...</Typography>
            </Box>
          </Box>
        )}

        {warningRequestsReached && !maxRequestsReached && bids.length === 0 && (
          <Box paddingTop="1rem">
            <Alert variant="standard" severity="info">
              There should be bids by now... You can wait longer in case a bid shows up or close the deployment and try again with a different configuration.
            </Alert>
          </Box>
        )}

        {maxRequestsReached && bids.length === 0 && (
          <Box paddingTop="1rem">
            <Alert variant="standard" severity="warning">
              There's no bid for the current deployment. You can close the deployment and try again with a different configuration.
            </Alert>
          </Box>
        )}

        {bids.length > 0 && (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <FormControlLabel
                control={<Checkbox checked={isFilteringFavorites} onChange={(ev, value) => setIsFilteringFavorites(value)} color="primary" size="small" />}
                label="Favorites"
              />

              <FormControlLabel
                control={<Checkbox checked={isFilteringAudited} onChange={(ev, value) => setIsFilteringAudited(value)} color="primary" size="small" />}
                label="Audited"
              />
            </Box>

            {!maxRequestsReached && (
              <Box display="flex" alignItems="center" lineHeight="1rem" fontSize=".7rem">
                <div style={{ color: "grey" }}>
                  <Typography variant="caption">Waiting for more bids...</Typography>
                </div>
                <Box marginLeft=".5rem">
                  <CircularProgress size=".7rem" />
                </Box>
              </Box>
            )}
          </Box>
        )}

        <LinearLoadingSkeleton isLoading={isSendingManifest} />
      </Box>

      {dseqList.length > 0 && (
        <ViewPanel bottomElementId="footer" overflow="auto" padding="0 1rem 2rem">
          {dseqList.map((gseq, i) => (
            <BidGroup
              key={gseq}
              gseq={gseq}
              bids={groupedBids[gseq]}
              handleBidSelected={handleBidSelected}
              selectedBid={selectedBids[gseq]}
              disabled={isSendingManifest}
              providers={providers}
              filteredBids={filteredBids}
              deploymentDetail={deploymentDetail}
              isFilteringFavorites={isFilteringFavorites}
              isFilteringAudited={isFilteringAudited}
              groupIndex={i}
              totalBids={dseqList.length}
            />
          ))}
        </ViewPanel>
      )}
    </>
  );
}
