import { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, CircularProgress, makeStyles, Tooltip } from "@material-ui/core";
import { deploymentData } from "../../shared/deploymentData";
import { defaultInitialDeposit } from "../../shared/constants";
import { useWallet } from "../../context/WalletProvider";
import MonacoEditor from "react-monaco-editor";
import Alert from "@material-ui/lab/Alert";
import InfoIcon from "@material-ui/icons/Info";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForward";
import { useHistory } from "react-router";
import { saveDeploymentManifestAndName } from "../../shared/utils/deploymentLocalDataUtils";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { useTransactionModal } from "../../context/TransactionModal";
import { useSettings } from "../../context/SettingsProvider";
import { Helmet } from "react-helmet-async";
import { analytics } from "../../shared/utils/analyticsUtils";
import { DeploymentDepositModal } from "../DeploymentDetail/DeploymentDepositModal";
import { LinkTo } from "../../shared/components/LinkTo";
import { monacoOptions } from "../../shared/constants";
import { ViewPanel } from "../../shared/components/ViewPanel";
import { Timer } from "../../shared/utils/timer";

const yaml = require("js-yaml");

const useStyles = makeStyles((theme) => ({
  tooltip: {
    fontSize: "1rem"
  },
  tooltipIcon: {
    fontSize: "1.5rem",
    marginRight: "1rem",
    color: theme.palette.text.secondary
  },
  alert: {
    marginBottom: "1rem"
  }
}));

export function ManifestEdit(props) {
  const { editedManifest, setEditedManifest, selectedTemplate } = props;
  const [parsingError, setParsingError] = useState(null);
  const [deploymentName, setDeploymentName] = useState("");
  const [isCreatingDeployment, setIsCreatingDeployment] = useState(false);
  const { sendTransaction } = useTransactionModal();
  const { settings } = useSettings();
  const { address } = useWallet();
  const [isDepositingDeployment, setIsDepositingDeployment] = useState(false);
  const history = useHistory();
  const classes = useStyles();

  async function handleTextChange(value) {
    setEditedManifest(value);
  }

  useEffect(() => {
    const timer = Timer(500);

    timer.start().then(() => {
      createAndValidateDeploymentData(editedManifest, "TEST_DSEQ_VALIDATION");
    });

    return () => {
      if (timer) {
        timer.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedManifest]);

  async function createAndValidateDeploymentData(yamlStr, dseq = null, deposit = defaultInitialDeposit, depositorAddress = null) {
    try {
      if (!editedManifest) return null;

      const doc = yaml.load(yamlStr);
      const dd = await deploymentData.NewDeploymentData(settings.apiEndpoint, doc, dseq, address, deposit, depositorAddress);
      validateDeploymentData(dd);

      setParsingError(null);

      return dd;
    } catch (err) {
      if (err.name === "YAMLException" || err.name === "CustomValidationError") {
        setParsingError(err.message);
      } else if (err.name === "TemplateValidation") {
        setParsingError(err.message);
      } else {
        setParsingError("Error while parsing SDL file");
        console.error(err);
      }
    }
  }

  function handleDocClick(ev, url) {
    ev.preventDefault();

    window.electron.openUrl(url);
  }

  function validateDeploymentData(deploymentData) {
    if (selectedTemplate.valuesToChange) {
      for (const valueToChange of selectedTemplate.valuesToChange) {
        if (valueToChange.field === "accept" || valueToChange.field === "env") {
          const serviceNames = Object.keys(deploymentData.sdl.services);
          for (const serviceName of serviceNames) {
            if (
              deploymentData.sdl.services[serviceName].expose?.some((e) => e.accept?.includes(valueToChange.initialValue)) ||
              deploymentData.sdl.services[serviceName].env?.some((e) => e?.includes(valueToChange.initialValue))
            ) {
              let error = new Error(`Template value of "${valueToChange.initialValue}" needs to be changed`);
              error.name = "TemplateValidation";

              throw error;
            }
          }
        }
      }
    }
  }

  const onDeploymentDeposit = async (deposit, depositorAddress) => {
    setIsDepositingDeployment(false);
    await handleCreateClick(deposit, depositorAddress);
  };

  async function handleCreateClick(deposit, depositorAddress) {
    setIsCreatingDeployment(true);
    const dd = await createAndValidateDeploymentData(editedManifest, null, deposit, depositorAddress);

    if (!dd) return;

    try {
      const message = TransactionMessageData.getCreateDeploymentMsg(dd);
      const response = await sendTransaction([message]);

      if (response) {
        saveDeploymentManifestAndName(dd.deploymentId.dseq, editedManifest, dd.version, address, deploymentName);

        history.replace("/createDeployment/acceptBids/" + dd.deploymentId.dseq);

        await analytics.event("deploy", "create deployment");
      }
    } catch (error) {
      setIsCreatingDeployment(false);
      throw error;
    }
  }

  return (
    <>
      <Helmet title="Create Deployment - Manifest Edit" />

      <Box padding="0 1rem">
        <Box marginBottom=".5rem" display="flex" alignItems="center" justifyContent="space-between">
          <Box flexGrow={1} paddingRight="1rem">
            <TextField
              value={deploymentName}
              onChange={(ev) => setDeploymentName(ev.target.value)}
              fullWidth
              label="Name your deployment (optional)"
              variant="outlined"
            />
          </Box>

          <Box display="flex" alignItems="center">
            <Tooltip
              classes={{ tooltip: classes.tooltip }}
              arrow
              interactive
              title={
                <>
                  <Typography>
                    You may use the sample deployment file as-is or modify it for your own needs as described in the{" "}
                    <LinkTo onClick={(ev) => handleDocClick(ev, "https://docs.akash.network/intro-to-akash/stack-definition-language")}>
                      SDL (Stack Definition Language)
                    </LinkTo>{" "}
                    documentation. A typical modification would be to reference your own image instead of the demo app image.
                  </Typography>
                </>
              }
            >
              <InfoIcon className={classes.tooltipIcon} />
            </Tooltip>

            <Button
              variant="contained"
              color="primary"
              disabled={isCreatingDeployment || !!parsingError || !editedManifest}
              onClick={() => setIsDepositingDeployment(true)}
            >
              {isCreatingDeployment ? (
                <CircularProgress size="24px" color="primary" />
              ) : (
                <>
                  Create Deployment{" "}
                  <Box component="span" marginLeft=".5rem" display="flex" alignItems="center">
                    <ArrowForwardIosIcon fontSize="small" />
                  </Box>
                </>
              )}
            </Button>
          </Box>
        </Box>
      </Box>

      {parsingError && <Alert severity="warning">{parsingError}</Alert>}

      <ViewPanel bottomElementId="footer" overflow="hidden">
        <MonacoEditor language="yaml" theme="vs-dark" value={editedManifest} onChange={handleTextChange} options={monacoOptions} />
      </ViewPanel>

      {isDepositingDeployment && (
        <DeploymentDepositModal
          handleCancel={() => setIsDepositingDeployment(false)}
          onDeploymentDeposit={onDeploymentDeposit}
          min={5}
          infoText={
            <Alert severity="info" className={classes.alert}>
              <Typography variant="caption">
                To create a deployment you need a minimum of <strong>5AKT</strong> for the{" "}
                <LinkTo onClick={(ev) => handleDocClick(ev, "https://docs.akash.network/glossary/escrow#escrow-accounts")}>
                  <strong>escrow account.</strong>
                </LinkTo>{" "}
                Escrow accounts are a mechanism that allow for time-based payments from one bank account to another without block-by-block micropayments. If
                your escrow account runs out, your deployment will automatically close. You can still add more funds to your deployment escrow once it's
                created.
              </Typography>
            </Alert>
          }
        />
      )}
    </>
  );
}
