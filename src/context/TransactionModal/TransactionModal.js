import { useEffect, useState } from "react";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box, Tabs, Tab, AppBar, useTheme } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { a11yProps } from "../../shared/utils/a11yUtils";
import { TabPanel } from "../../shared/components/TabPanel";
import { createFee, customRegistry } from "../../shared/utils/blockchainUtils";
import { SigningStargateClient } from "@cosmjs/stargate";
import { rpcEndpoint } from "../../shared/constants";
import { useWallet } from "../../WalletProvider/WalletProviderContext";

const a11yPrefix = "transaction-tab";

export function TransactionModal(props) {
  const { isOpen, onConfirmTransaction, messages } = props;
  const { address, selectedWallet } = useWallet();
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [error, setError] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [memo, setMemo] = useState("Akashlytics tx");
  const [gas, setGas] = useState();
  const theme = useTheme();

  useEffect(() => {
    // setPassword("");
  }, [isOpen]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");

    try {
      const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, selectedWallet, {
        registry: customRegistry
      });

      await client.signAndBroadcast(address, messages, createFee("avg"));

      onConfirmTransaction();
    } catch (err) {
      console.error(err);
      // TODO return error?
      // or throw?
      // setError("Invalid password");
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Dialog open={props.isOpen} onClose={props.onClose} aria-labelledby="transaction-modal" aria-describedby="transaction modal description">
      <DialogTitle id="transaction-modal">Akash Transaction</DialogTitle>
      <DialogContent dividers>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="Akash transaction data"
          >
            <Tab label="Details" {...a11yProps(`${a11yPrefix}-${0}`)} />
            <Tab label="Data" {...a11yProps(`${a11yPrefix}-${1}`)} />
          </Tabs>
        </AppBar>

        <TabPanel value={tabIndex} index={0}>
          Item One
          {/**
           * TODO
           */}
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          Item Two
          {/**
           * TODO
           */}
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={props.onClose} type="button">
          Reject
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
