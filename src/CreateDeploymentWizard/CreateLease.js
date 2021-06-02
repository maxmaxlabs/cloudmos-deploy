import React, { useState, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { apiEndpoint, rpcEndpoint } from "../shared/constants"
import { SigningStargateClient } from "@cosmjs/stargate";
import { customRegistry, baseFee, createFee } from "../shared/utils/blockchainUtils";
import {
  Button,
  Radio,
  List,
  ListItemText,
  ListItemIcon,
  ListItem,
  CircularProgress
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export function CreateLease(props) {
  const [bids, setBids] = useState([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  const classes = useStyles();

  const { dseq, address, selectedWallet } = props;

  useEffect(() => {
    loadBids();
  }, [address, dseq]);

  const loadBids = useCallback(async () => {
    setIsLoadingBids(true);

    const response = await fetch(apiEndpoint + "/akash/market/v1beta1/bids/list?filters.owner=" + address + "&filters.dseq=" + dseq);
    const data = await response.json();

    setBids(data.bids.map(b => ({
      id: b.bid.bid_id.provider + b.bid.bid_id.dseq + b.bid.bid_id.gseq + b.bid.bid_id.oseq,
      owner: b.bid.bid_id.owner,
      provider: b.bid.bid_id.provider,
      dseq: b.bid.bid_id.dseq,
      gseq: b.bid.bid_id.gseq,
      oseq: b.bid.bid_id.oseq,
      price: b.bid.price,
      state: b.bid.state
    })));

    setIsLoadingBids(false);
  }, [address, dseq]);

  const handleToggle = (value) => {
    setSelectedBid(bids.find(b => b.id === value));
  };

  async function acceptBid(bid) {
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, selectedWallet, {
      registry: customRegistry
    });

    const createLeaseMsg = {
      "typeUrl": "/akash.market.v1beta1.MsgCreateLease",
      "value": {
        "bid_id": {
          "owner": bid.owner,
          "dseq": bid.dseq,
          "gseq": bid.gseq,
          "oseq": bid.oseq,
          "provider": bid.provider
        }
      }
    };

    await client.signAndBroadcast(address, [createLeaseMsg], createFee("200000"), "Test Akashlytics");
  }

  async function handleNext() {
    await acceptBid(selectedBid);
  }

  return (
    <>
      {isLoadingBids && <CircularProgress />}
      <List className={classes.root}>
        {bids.map((bid) => {
          const labelId = `checkbox-list-label-${bid.id}`;

          return (
            <ListItem disabled={true} key={bid.id} dense button onClick={() => handleToggle(bid.id)}>
              <ListItemIcon>
                <Radio
                  checked={selectedBid?.id === bid.id}
                  //onChange={handleChange}
                  value={bid.id}
                  name="radio-button-demo"
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={<>{bid.price.amount} uakt / block ({bid.state})</>} secondary={bid.provider} />
            </ListItem>
          );
        })}
      </List>

      {/* <TextField
        label="Choose a password to keep this wallet safe"
        fullWidth
        rows={4}
        value={password}
        onChange={ev => setPassword(ev.target.value)}
        variant="outlined"
      /> */}

      <Button variant="contained" color="primary" onClick={handleNext} disabled={!selectedBid}>
        Accept Bid
      </Button>
    </>
  )
}