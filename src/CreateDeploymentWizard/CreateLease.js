import React, { useState, useCallback, useEffect } from "react";
import { apiEndpoint, rpcEndpoint } from "../shared/constants";
import { SigningStargateClient } from "@cosmjs/stargate";
import { customRegistry, createFee } from "../shared/utils/blockchainUtils";
import { Button, CircularProgress } from "@material-ui/core";
import { useWallet } from "../WalletProvider/WalletProviderContext";
import { BidGroup } from "./BidGroup";
import { useHistory } from "react-router";

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

    setBids(
      data.bids.map((b) => ({
        id: b.bid.bid_id.provider + b.bid.bid_id.dseq + b.bid.bid_id.gseq + b.bid.bid_id.oseq,
        owner: b.bid.bid_id.owner,
        provider: b.bid.bid_id.provider,
        dseq: b.bid.bid_id.dseq,
        gseq: b.bid.bid_id.gseq,
        oseq: b.bid.bid_id.oseq,
        price: b.bid.price,
        state: b.bid.state
      }))
    );

    setIsLoadingBids(false);
  }, [address, dseq]);

  const handleBidSelected = (bid) => {
    setSelectedBids({ ...selectedBids, [bid.gseq]: bid });
  };

  async function acceptBid(bids) {
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, selectedWallet, {
      registry: customRegistry
    });

    const messages = bids.map((bid) => ({
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
  }

  async function handleNext() {
    //await acceptBid(selectedBids);

    history.push("/deployment/" + dseq);
  }

  const groupedBids = bids.reduce((a, b) => {
    a[b.gseq] = [...(a[b.gseq] || []), b];
    return a;
  }, {});

  const groupCount = Object.keys(groupedBids).length;

  return (
    <>
      {isLoadingBids && <CircularProgress />}
      {Object.keys(groupedBids).map((gseq) => (
        <BidGroup key={gseq} gseq={gseq} bids={groupedBids[gseq]} handleBidSelected={handleBidSelected} selectedBid={selectedBids[gseq]} />
      ))}

      <Button variant="contained" color="primary" onClick={handleNext} disabled={Object.keys(groupedBids).some(gseq => !selectedBids[gseq])}>
        Accept Bid{groupCount > 1 ? "s" : ""}
      </Button>
    </>
  );
}
