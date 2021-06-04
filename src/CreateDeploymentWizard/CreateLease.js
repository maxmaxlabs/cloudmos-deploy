import React, { useState, useCallback, useEffect } from "react";
import { apiEndpoint, rpcEndpoint } from "../shared/constants";
import { SigningStargateClient } from "@cosmjs/stargate";
import { customRegistry, createFee } from "../shared/utils/blockchainUtils";
import { Box, Button, CircularProgress } from "@material-ui/core";
import { useWallet } from "../WalletProvider/WalletProviderContext";
import { BidGroup } from "./BidGroup";
import { useHistory } from "react-router";
import { closeDeployment } from "../shared/utils/deploymentDetailUtils";
import Alert from "@material-ui/lab/Alert";

export function CreateLease(props) {
  const [bids, setBids] = useState([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [selectedBids, setSelectedBids] = useState({});

  const { address, selectedWallet } = useWallet();
  const history = useHistory();

  const { dseq } = props;

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
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, selectedWallet, {
      registry: customRegistry
    });

    const messages = Object.keys(bids).map(gseq => bids[gseq]).map((bid) => ({
      typeUrl: "/akash.market.v1beta1.MsgCreateLease",
      value: {
        bid_id: {
          owner: bid.owner,
          dseq: bid.dseq,
          gseq: bid.gseq,
          oseq: bid.oseq,
          provider: bid.provider
        }
      }
    }));

    await client.signAndBroadcast(address, messages, createFee("200000"), "Test Akashlytics");

    history.push("/deployment/" + dseq);
  }

  async function handleNext() {
    await acceptBids(selectedBids);

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
            All bids for this deployment are closed. This can happen if no bids are accepted for more than 5 minutes after the deployment creation.
            You can close this deployment and create a new one.
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
