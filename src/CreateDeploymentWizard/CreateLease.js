import React, { useState, useCallback, useEffect } from "react";
import { apiEndpoint, rpcEndpoint } from "../shared/constants";
import { SigningStargateClient } from "@cosmjs/stargate";
import { customRegistry, createFee } from "../shared/utils/blockchainUtils";
import { Box, Button, CircularProgress } from "@material-ui/core";
import { useWallet } from "../WalletProvider/WalletProviderContext";
import { BidGroup } from "./BidGroup";
import { useHistory } from "react-router";
import { closeDeployment } from "../shared/utils/deploymentDetailUtils";
import { Manifest } from "../shared/utils/deploymentUtils";
import { useCertificate } from "../CertificateProvider/CertificateProviderContext";
import { fetchProviderInfo } from "../shared/providerCache";
import Alert from "@material-ui/lab/Alert";
import { getDeploymentLocalData } from "../shared/utils/deploymentLocalDataUtils";
import { useTransactionModal } from "../context/TransactionModal";

const yaml = require("js-yaml");

export function CreateLease(props) {
  const [bids, setBids] = useState([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [selectedBids, setSelectedBids] = useState({});
  const { sendTransaction } = useTransactionModal();
  const { address, selectedWallet } = useWallet();
  const { localCert } = useCertificate();
  const history = useHistory();

  const { dseq, editedManifest } = props;

  useEffect(() => {
    loadBids();
  }, [address, dseq]);

  const loadBids = useCallback(async () => {
    setIsLoadingBids(true);

    const response = await fetch(apiEndpoint + "/akash/market/v1beta1/bids/list?filters.owner=" + address + "&filters.dseq=" + dseq);
    const data = await response.json();
    const bids = data.bids.map((b) => ({
      id: b.bid.bid_id.provider + b.bid.bid_id.dseq + b.bid.bid_id.gseq + b.bid.bid_id.oseq,
      owner: b.bid.bid_id.owner,
      provider: b.bid.bid_id.provider,
      dseq: b.bid.bid_id.dseq,
      gseq: b.bid.bid_id.gseq,
      oseq: b.bid.bid_id.oseq,
      price: b.bid.price,
      state: b.bid.state
    }));

    setBids(bids);
    setIsLoadingBids(false);

    if (bids.length === 0) {
      setTimeout(() => {
        loadBids();
      }, 7000);
    }
  }, [address, dseq]);

  const handleBidSelected = (bid) => {
    setSelectedBids({ ...selectedBids, [bid.gseq]: bid });
  };

  async function acceptBids(bids) {
    try {
      const messages = Object.keys(bids)
        .map((gseq) => bids[gseq])
        .map((bid) => TransactionMessage.getCreateLeaseMsg(bid));
      // TODO handle response
      const response = await sendTransaction(messages);
    } catch (error) {}

    history.push("/deployment/" + dseq);
  }

  async function sendManifest(providerInfo, manifestStr) {
    const flags = {};
    const doc = yaml.load(manifestStr);
    const mani = Manifest(doc);

    const response = await window.electron.queryProvider(
      providerInfo.host_uri + "/deployment/" + dseq + "/manifest",
      "PUT",
      JSON.stringify(mani, (key, value) => {
        if (key === "storage" || key === "memory") {
          let newValue = { ...value };
          newValue.size = newValue.quantity;
          delete newValue.quantity;
          return newValue;
        }
        return value;
      }),
      localCert.certPem,
      localCert.keyPem
    );
    console.log(response);
  }

  async function handleNext() {
    console.log("Accepting bids...");
    await acceptBids(selectedBids);

    const deploymentData = getDeploymentLocalData(dseq);
    if (deploymentData && deploymentData.manifest) {
      console.log("Querying provider info");
      const providerInfo = await fetchProviderInfo(selectedBids[Object.keys(selectedBids)[0]].provider);
      console.log("Sending manifest");
      await sendManifest(providerInfo, deploymentData.manifest);
    }

    history.push("/deployment/" + dseq);
  }

  async function handleCloseDeployment() {
    await closeDeployment(dseq, address, selectedWallet);

    history.push("/");
  }

  const groupedBids = bids.reduce((a, b) => {
    a[b.gseq] = [...(a[b.gseq] || []), b];
    return a;
  }, {});

  const dseqList = Object.keys(groupedBids);

  const allClosed = bids.every((bid) => bid.state === "closed");

  return (
    <>
      {isLoadingBids && <CircularProgress />}
      {dseqList.map((gseq) => (
        <BidGroup key={gseq} gseq={gseq} bids={groupedBids[gseq]} handleBidSelected={handleBidSelected} selectedBid={selectedBids[gseq]} />
      ))}

      {!isLoadingBids && !allClosed && (
        <Box mt={1}>
          <Button variant="contained" color="primary" onClick={handleNext} disabled={dseqList.some((gseq) => !selectedBids[gseq])}>
            Accept Bid{dseqList.length > 1 ? "s" : ""}
          </Button>
        </Box>
      )}
      {!isLoadingBids && allClosed && (
        <>
          <Alert severity="info">
            All bids for this deployment are closed. This can happen if no bids are accepted for more than 5 minutes after the deployment creation. You can
            close this deployment and create a new one.
          </Alert>
          <Box mt={1}>
            <Button variant="contained" color="primary" onClick={handleCloseDeployment}>
              Close Deployment
            </Button>
          </Box>
        </>
      )}
    </>
  );
}
