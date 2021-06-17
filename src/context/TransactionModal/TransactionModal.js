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
import { useWallet } from "../WalletProvider";
import clsx from "clsx";
import { TransactionMessage } from "./TransactionMessage";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { useSnackbar } from "notistack";
import { useStyles } from "./TransactionModal.styles";
import { useSettings } from "../SettingsProvider";

const a11yPrefix = "transaction-tab";

export function TransactionModal(props) {
  const { isOpen, onConfirmTransaction, messages } = props;
  const { settings } = useSettings();
  const { address, selectedWallet, refreshBalance } = useWallet();
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [error, setError] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [memo, setMemo] = useState("");
  const [gas, setGas] = useState(baseGas);
  const [isSettingGas, setIsSettingGas] = useState(false);
  const [currentFee, setCurrentFee] = useState("avg");
  const classes = useStyles();
  const lowFee = createFee("low", baseGas, messages.length);
  const avgFee = createFee("avg", baseGas, messages.length);
  const highFee = createFee("high", baseGas, messages.length);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");
    setIsSendingTransaction(true);

    let pendingSnackbarKey = enqueueSnackbar(
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
      const client = await SigningStargateClient.connectWithSigner(settings.rpcEndpoint, selectedWallet, {
        registry: customRegistry,
        broadcastTimeoutMs: 300_000 // 5min
      });

      const fee = createFee(currentFee, gas, messages.length);
      const response = await client.signAndBroadcast(address, messages, fee, `Akashlytics tx: ${memo}`);

      console.log(response);

      if (response.code !== 0) {
        throw new Error("Code " + response.code + " : " + response.rawLog);
      }

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

      let errorMsg = "An error has occured";

      if (err.message.includes("was submitted but was not yet found on the chain")) {
        errorMsg = "Transaction timeout";
      } else {
        try {
          const reg = /Broadcasting transaction failed with code (.+?) \(codespace: (.+?)\)/i;
          const match = err.message.match(reg);

          if (match) {
            const code = parseInt(match[1]);
            const codeSpace = match[2];

            if (codeSpace === "sdk") {
              const errorMessages = {
                5: "Insufficient funds",
                9: "Unknown address",
                11: "Out of gas",
                12: "Memo too large",
                13: "Insufficient fee",
                19: "Tx already in mempool",
                25: "Invalid gas adjustment"
              };

              if (code in errorMessages) {
                errorMsg = errorMessages[code];
              }
            }
          }
        } catch (err) {
          console.error(err);
        }
      }

      enqueueSnackbar(
        <div>
          <Typography variant="h5" className={classes.snackBarTitle}>
            Tx has failed...
          </Typography>
          <Typography variant="body1" className={classes.snackBarSubTitle}>
            {errorMsg}
          </Typography>
        </div>,
        { variant: "error" }
      );

      setIsSendingTransaction(false);
    } finally {
      closeSnackbar(pendingSnackbarKey);
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const onSetGasClick = (event) => {
    event.preventDefault();
    setIsSettingGas(!isSettingGas);
  };

  const isGasValid = gas && parseInt(gas) > 0;

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
              inputProps={{
                maxLength: 256
              }}
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
                defaultValue={baseGas}
                onChange={(ev) => setGas(ev.target.value)}
                type="number"
                variant="outlined"
                error={!isGasValid}
                inputProps={{
                  step: 1,
                  min: 1
                }}
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
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSendingTransaction || !isGasValid} classes={{ root: classes.actionButton }}>
          {isSendingTransaction ? <CircularProgress size="24px" color="primary" /> : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
