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
  Typography,
  Badge,
  List,
  ButtonGroup,
  Link,
  CircularProgress
} from "@material-ui/core";
import { a11yProps } from "../../shared/utils/a11yUtils";
import { TabPanel } from "../../shared/components/TabPanel";
import { baseGas, createFee, customRegistry, fees, createCustomFee } from "../../shared/utils/blockchainUtils";
import { SigningStargateClient } from "@cosmjs/stargate";
import { useWallet } from "../WalletProvider";
import clsx from "clsx";
import { TransactionMessage } from "./TransactionMessage";
import { aktToUakt, uaktToAKT } from "../../shared/utils/priceUtils";
import { useSnackbar } from "notistack";
import { useStyles } from "./TransactionModal.styles";
import { useSettings } from "../SettingsProvider";
import { Snackbar } from "../../shared/components/Snackbar";
import { analytics } from "../../shared/utils/analyticsUtils";
import { transactionLink } from "../../shared/constants";
import { BroadcastingError } from "../../shared/utils/errors";
import OpenInNew from "@material-ui/icons/OpenInNew";
import { PriceValue } from "../../shared/components/PriceValue";

const a11yPrefix = "transaction-tab";

export function TransactionModal(props) {
  const { isOpen, onConfirmTransaction, messages } = props;
  const { settings } = useSettings();
  const { address, selectedWallet, refreshBalance } = useWallet();
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [memo, setMemo] = useState("");
  const [gas, setGas] = useState(baseGas);
  const [customFee, setCustomFee] = useState(uaktToAKT(fees["avg"]));
  const [isSettingCustomFee, setIsCustomFee] = useState(false);
  const [currentFee, setCurrentFee] = useState("avg");
  const classes = useStyles();
  const lowFee = createFee("low", baseGas, messages.length);
  const avgFee = createFee("avg", baseGas, messages.length);
  const highFee = createFee("high", baseGas, messages.length);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const isCustomFeeValid = customFee && parseFloat(customFee) > 0;
  const isGasValid = gas && parseInt(gas) > 0;

  async function handleSubmit(ev) {
    ev.preventDefault();
    setIsSendingTransaction(true);

    let pendingSnackbarKey = enqueueSnackbar(<Snackbar title="Tx is pending..." subTitle="Please wait a few seconds" />, { variant: "info" });

    try {
      const client = await SigningStargateClient.connectWithSigner(settings.rpcEndpoint, selectedWallet, {
        registry: customRegistry,
        broadcastTimeoutMs: 300_000 // 5min
      });

      const fee = isSettingCustomFee ? createCustomFee(aktToUakt(customFee), gas, messages.length) : createFee(currentFee, gas, messages.length);
      const response = await client.signAndBroadcast(address, messages, fee, memo);
      const transactionHash = response.transactionHash;
      const isError = response.code !== 0;

      console.log(response);

      if (isError) {
        throw new BroadcastingError("Code " + response.code + " : " + response.rawLog, transactionHash);
      }

      showTransactionSnackbar("Tx succeeds!", "Congratulations 🎉", transactionHash, "success");

      await analytics.event("deploy", "successful transaction");

      refreshBalance();

      // return response message
      onConfirmTransaction(response);
    } catch (err) {
      console.error(err);

      const transactionHash = err.txHash;
      let errorMsg = "An error has occured";

      await analytics.event("deploy", "failed transaction");

      if (err.message.includes("was submitted but was not yet found on the chain")) {
        errorMsg = "Transaction timeout";
      } else {
        try {
          const reg = /Broadcasting transaction failed with code (.+?) \(codespace: (.+?)\)/i;
          const match = err.message.match(reg);
          const log = err.message.substring(err.message.indexOf("Log"), err.message.length);

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

          if (log) {
            errorMsg += `. ${log}`;
          }
        } catch (err) {
          console.error(err);
        }
      }

      showTransactionSnackbar("Tx has failed...", errorMsg, transactionHash, "error");

      setIsSendingTransaction(false);
    } finally {
      closeSnackbar(pendingSnackbarKey);
    }
  }

  const showTransactionSnackbar = (snackTitle, snackMessage, transactionHash, snackVariant) => {
    enqueueSnackbar(<Snackbar title={snackTitle} subTitle={<TransactionSnackbarContent snackMessage={snackMessage} transactionHash={transactionHash} />} />, {
      variant: snackVariant,
      autoHideDuration: 15000
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const onSetGasClick = (event) => {
    event.preventDefault();
    setIsCustomFee(!isSettingCustomFee);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={!isSendingTransaction ? props.onClose : null}
      maxWidth="xs"
      fullWidth
      aria-labelledby="transaction-modal"
      aria-describedby="transaction modal description"
    >
      <DialogTitle id="transaction-modal">
        <span className={classes.title}>Akash Transaction</span>
      </DialogTitle>
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
          <Badge color="primary" badgeContent={messages.length} classes={{ badge: classes.badge }}>
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
              disabled={isSendingTransaction}
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
            <ButtonGroup
              size="large"
              color="primary"
              aria-label="large outlined primary button group"
              classes={{ root: classes.fullWidth }}
              disabled={isSettingCustomFee}
            >
              <Button
                disabled={isSendingTransaction}
                classes={{ root: classes.feeButton, label: classes.feeButtonLabel }}
                variant={currentFee === "low" ? "contained" : "outlined"}
                onClick={() => setCurrentFee("low")}
              >
                <Box>Low</Box>
                <Box>
                  <Typography variant="caption">
                    <PriceValue value={uaktToAKT(lowFee.amount[0].amount, 4)} />
                  </Typography>
                </Box>
                <div className={clsx(classes.feeButtonLabelAmount, { [classes.textWhite]: currentFee === "low" })}>
                  {uaktToAKT(lowFee.amount[0].amount, 4)}AKT
                </div>
              </Button>
              <Button
                disabled={isSendingTransaction}
                classes={{ root: classes.feeButton, label: classes.feeButtonLabel }}
                variant={currentFee === "avg" ? "contained" : "outlined"}
                onClick={() => setCurrentFee("avg")}
              >
                <Box>Avg</Box>
                <Box>
                  <Typography variant="caption">
                    <PriceValue value={uaktToAKT(avgFee.amount[0].amount, 4)} />
                  </Typography>
                </Box>
                <div className={clsx(classes.feeButtonLabelAmount, { [classes.textWhite]: currentFee === "avg" })}>
                  {uaktToAKT(avgFee.amount[0].amount, 4)}AKT
                </div>
              </Button>
              <Button
                disabled={isSendingTransaction}
                classes={{ root: classes.feeButton, label: classes.feeButtonLabel }}
                variant={currentFee === "high" ? "contained" : "outlined"}
                onClick={() => setCurrentFee("high")}
              >
                <Box>High</Box>
                <Box>
                  <Typography variant="caption">
                    <PriceValue value={uaktToAKT(highFee.amount[0].amount, 4)} />
                  </Typography>
                </Box>
                <div className={clsx(classes.feeButtonLabelAmount, { [classes.textWhite]: currentFee === "high" })}>
                  {uaktToAKT(highFee.amount[0].amount, 4)}AKT
                </div>
              </Button>
            </ButtonGroup>
          </Box>
          <Box>
            {!isSendingTransaction && (
              <Typography className={classes.setGasLink}>
                <Link href="#" onClick={onSetGasClick}>
                  Set custom fee
                </Link>
              </Typography>
            )}
            {!isSendingTransaction && isSettingCustomFee && (
              <>
                <Box marginBottom=".5rem">
                  <TextField
                    label="Fee (AKT)"
                    value={customFee}
                    onChange={(ev) => setCustomFee(ev.target.value)}
                    type="number"
                    variant="outlined"
                    error={!isCustomFeeValid}
                    inputProps={{
                      step: 0.001,
                      min: 0
                    }}
                    classes={{ root: classes.fullWidth }}
                  />
                </Box>

                <Box>
                  <TextField
                    label="Gas"
                    value={gas}
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
                </Box>
              </>
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSendingTransaction || !isGasValid}
          classes={{ root: classes.actionButton }}
        >
          {isSendingTransaction ? <CircularProgress size="24px" color="primary" /> : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const TransactionSnackbarContent = ({ snackMessage, transactionHash }) => {
  const classes = useStyles();

  return (
    <>
      {snackMessage}
      <br />
      {transactionHash && (
        <Box component="a" display="flex" alignItems="center" href="#" onClick={() => window.electron.openUrl(transactionLink(transactionHash))}>
          View transaction <OpenInNew className={classes.transactionLinkIcon} />
        </Box>
      )}
    </>
  );
};
