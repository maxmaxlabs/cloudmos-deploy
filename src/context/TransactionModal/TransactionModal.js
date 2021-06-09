import { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Tabs,
  Tab,
  AppBar,
  makeStyles,
  Typography,
  Badge,
  List,
  ButtonGroup,
  Link,
  CircularProgress
} from "@material-ui/core";
import { a11yProps } from "../../shared/utils/a11yUtils";
import { TabPanel } from "../../shared/components/TabPanel";
import { baseGas, createFee, customRegistry } from "../../shared/utils/blockchainUtils";
import { SigningStargateClient } from "@cosmjs/stargate";
import { rpcEndpoint } from "../../shared/constants";
import { useWallet } from "../WalletProvider";
import clsx from "clsx";
import { TransactionMessage } from "./TransactionMessage";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { useSnackbar } from "notistack";
import { useStyles } from "./TransactionModal.styles";

const a11yPrefix = "transaction-tab";

export function TransactionModal(props) {
  const { isOpen, onConfirmTransaction, messages } = props;
  const { address, selectedWallet, refreshBalance } = useWallet();
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [error, setError] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [memo, setMemo] = useState("Akashlytics tx");
  const [gas, setGas] = useState(baseGas);
  const [isSettingGas, setIsSettingGas] = useState(false);
  const [currentFee, setCurrentFee] = useState("avg");
  const classes = useStyles();
  const lowFee = createFee("low", baseGas, messages.length);
  const avgFee = createFee("avg", baseGas, messages.length);
  const highFee = createFee("high", baseGas, messages.length);
  const { enqueueSnackbar } = useSnackbar();

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");
    setIsSendingTransaction(true);

    enqueueSnackbar(
      <div>
        <Typography variant="h5" className={classes.snackBarTitle}>
          Tx is pending...
        </Typography>
        <Typography variant="body1" className={classes.snackBarSubTitle}>
          Please wait a few seconds
        </Typography>
      </div>,
      { variant: "info" }
    );

    try {
      const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, selectedWallet, {
        registry: customRegistry
      });

      const fee = createFee(currentFee, gas, messages.length);
      const response = await client.signAndBroadcast(address, messages, fee, memo);

      console.log(response);

      enqueueSnackbar(
        <div>
          <Typography variant="h5" className={classes.snackBarTitle}>
            Tx succeeds!
          </Typography>
          <Typography variant="body1" className={classes.snackBarSubTitle}>
            Congratulations 🎉
          </Typography>
        </div>,
        { variant: "success" }
      );

      refreshBalance();

      // return response message
      onConfirmTransaction(response);
    } catch (err) {
      console.error(err);

      enqueueSnackbar(
        <div>
          <Typography variant="h5" className={classes.snackBarTitle}>
            Tx has failed...
          </Typography>
          <Typography variant="body1" className={classes.snackBarSubTitle}>
            An error has occured
          </Typography>
        </div>,
        { variant: "error" }
      );

      onConfirmTransaction();
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const onSetGasClick = (event) => {
    event.preventDefault();
    setIsSettingGas(!isSettingGas);
  };

  return (
    <Dialog
      open={props.isOpen}
      onClose={!isSendingTransaction ? props.onClose : null}
      maxWidth="xs"
      fullWidth
      aria-labelledby="transaction-modal"
      aria-describedby="transaction modal description"
    >
      <DialogTitle id="transaction-modal">Akash Transaction</DialogTitle>
      <DialogContent dividers classes={{ root: classes.tabContent }}>
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

        <TabPanel value={tabIndex} index={0} className={classes.tabPanel}>
          <Badge color="secondary" badgeContent={messages.length} classes={{ badge: classes.badge }}>
            <Typography variant="h4" className={classes.label}>
              Messages
            </Typography>
          </Badge>

          <List dense className={classes.messages}>
            {messages.map((message, i) => {
              return <TransactionMessage key={`message_${i}`} message={message} />;
            })}
          </List>

          <Box padding="1rem 0">
            <TextField
              label="Memo"
              value={memo}
              onChange={(ev) => setMemo(ev.target.value)}
              type="text"
              variant="outlined"
              classes={{ root: classes.fullWidth }}
            />
          </Box>

          <Box>
            <ButtonGroup size="large" color="primary" aria-label="large outlined primary button group" classes={{ root: classes.fullWidth }}>
              <Button
                classes={{ root: classes.feeButton, label: classes.feeButtonLabel }}
                variant={currentFee === "low" ? "contained" : "outlined"}
                onClick={() => setCurrentFee("low")}
              >
                <Box>Low</Box>
                {/* TODO <div>Price</div> */}
                <div className={clsx(classes.feeButtonLabelAmount, { [classes.textWhite]: currentFee === "low" })}>
                  {uaktToAKT(lowFee.amount[0].amount, 4)}AKT
                </div>
              </Button>
              <Button
                classes={{ root: classes.feeButton, label: classes.feeButtonLabel }}
                variant={currentFee === "avg" ? "contained" : "outlined"}
                onClick={() => setCurrentFee("avg")}
              >
                <Box>Avg</Box>
                {/* TODO <div>Price</div> */}
                <div className={clsx(classes.feeButtonLabelAmount, { [classes.textWhite]: currentFee === "avg" })}>
                  {uaktToAKT(avgFee.amount[0].amount, 4)}AKT
                </div>
              </Button>
              <Button
                classes={{ root: classes.feeButton, label: classes.feeButtonLabel }}
                variant={currentFee === "high" ? "contained" : "outlined"}
                onClick={() => setCurrentFee("high")}
              >
                <Box>High</Box>
                {/* TODO <div>Price</div> */}
                <div className={clsx(classes.feeButtonLabelAmount, { [classes.textWhite]: currentFee === "high" })}>
                  {uaktToAKT(highFee.amount[0].amount, 4)}AKT
                </div>
              </Button>
            </ButtonGroup>
          </Box>
          <Box>
            <Typography className={classes.setGasLink}>
              <Link href="#" onClick={onSetGasClick}>
                Set gas
              </Link>
            </Typography>
            {isSettingGas && (
              <TextField
                label="Gas"
                value={gas}
                onChange={(ev) => setGas((ev.target.value || baseGas).toString())}
                type="number"
                variant="outlined"
                classes={{ root: classes.fullWidth }}
              />
            )}
          </Box>
        </TabPanel>
        <TabPanel value={tabIndex} index={1} className={clsx(classes.tabPanel)}>
          <Box className={classes.messagesData}>{JSON.stringify(messages, null, 2)}</Box>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          onClick={props.onClose}
          disabled={isSendingTransaction}
          type="button"
          classes={{ root: classes.actionButton }}
        >
          Reject
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSendingTransaction} classes={{ root: classes.actionButton }}>
          {isSendingTransaction ? <CircularProgress size="24px" color="primary" /> : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
