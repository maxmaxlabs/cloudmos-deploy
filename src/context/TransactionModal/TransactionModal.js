import { useEffect, useState } from "react";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { openWallet } from "../../walletHelper";
import { a11yProps } from "../../shared/utils/a11yUtils";
import { TabPanel } from "../../shared/components/TabPanel";
import { createFee } from "../../shared/utils/blockchainUtils";

const a11yPrefix = "transaction-tab";

export function TransactionModal(props) {
  const { isOpen, onConfirmTransaction, messages } = props;
  // const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const { address, selectedWallet } = useWallet();

  useEffect(() => {
    // setPassword("");
  }, [isOpen]);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");

    try {
      // await openWallet(password);
      await client.signAndBroadcast(address, messages, createFee("avg"));

      onConfirmTransaction();
    } catch (err) {
      console.error(err);
      // setError("Invalid password");
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleChangeIndex = (index) => {
    setTabIndex(index);
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

        <SwipeableViews axis={theme.direction === "rtl" ? "x-reverse" : "x"} index={tabIndex} onChangeIndex={handleChangeIndex}>
          <TabPanel value={tabIndex} index={0} dir={theme.direction}>
            Item One
          </TabPanel>
          <TabPanel value={tabIndex} index={1} dir={theme.direction}>
            Item Two
          </TabPanel>
        </SwipeableViews>
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
