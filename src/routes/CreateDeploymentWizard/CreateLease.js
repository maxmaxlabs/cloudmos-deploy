import React, { useState } from "react";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { Button, CircularProgress, Box, Typography, LinearProgress, Menu, MenuItem, IconButton, makeStyles } from "@material-ui/core";
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

const yaml = require("js-yaml");

const useStyles = makeStyles((theme) => ({
  root: {},
  alert: {
    marginBottom: "1rem"
  }
}));

export function CreateLease({ dseq }) {
  const [isSendingManifest, setIsSendingManifest] = useState(false);
  const [selectedBids, setSelectedBids] = useState({});
  const { sendTransaction } = useTransactionModal();
  const { address } = useWallet();
  const { localCert } = useCertificate();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const { data: providers } = useProviders();
  const classes = useStyles();

  const { data: bids, isLoading: isLoadingBids } = useBidList(address, dseq, {
    initialData: [],
    initialStale: true,
    refetchInterval: 7000
  });

  const handleBidSelected = (bid) => {
    setSelectedBids({ ...selectedBids, [bid.gseq]: bid });
  };

  async function sendManifest(providerInfo, manifestStr) {
    try {
      const response = await sendManifestToProvider(providerInfo, manifestStr, dseq, localCert);

      return response;
    } catch (err) {
      enqueueSnackbar("Error while sending manifest to provider", { variant: "error" });
      throw err;
    }
  }

  async function handleNext() {
    console.log("Accepting bids...");

    try {
      const messages = Object.keys(selectedBids)
        .map((gseq) => selectedBids[gseq])
        .map((bid) => TransactionMessageData.getCreateLeaseMsg(bid));
      const response = await sendTransaction(messages);

      if (!response) throw "Rejected transaction";

      await analytics.event("deploy", "create lease");
    } catch (error) {
      throw error;
    }

    setIsSendingManifest(true);

    const deploymentData = getDeploymentLocalData(dseq);
    if (deploymentData && deploymentData.manifest) {
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

    history.push(UrlService.deploymentDetails(dseq));
  }

  async function handleCloseDeployment() {
    try {
      const message = TransactionMessageData.getCloseDeploymentMsg(address, dseq);
      const response = await sendTransaction([message]);

      if (response) {
        history.push(UrlService.deploymentList());
      }
    } catch (error) {
      throw error;
    }
  }

  const [anchorEl, setAnchorEl] = useState(null);

  function handleMenuClick(ev) {
    setAnchorEl(ev.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const groupedBids = bids.reduce((a, b) => {
    a[b.gseq] = [...(a[b.gseq] || []), b];
    return a;
  }, {});

  const dseqList = Object.keys(groupedBids);

  const allClosed = bids.length > 0 && bids.every((bid) => bid.state === "closed");

  return (
    <>
      <Helmet title="Create Deployment - Create Lease" />

      {isSendingManifest && <LinearProgress />}

      {(isLoadingBids || bids.length === 0) && (
        <Box textAlign="center">
          <CircularProgress />
          <Box paddingTop="1rem">
            <Typography variant="body1">Waiting for bids...</Typography>
          </Box>
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
          <Alert severity="info">
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
