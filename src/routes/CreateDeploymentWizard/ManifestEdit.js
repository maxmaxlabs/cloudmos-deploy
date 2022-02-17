import { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, CircularProgress, makeStyles, Tooltip } from "@material-ui/core";
import { NewDeploymentData, defaultInitialDeposit } from "../../shared/utils/deploymentUtils";
import { useWallet } from "../../context/WalletProvider";
import MonacoEditor from "react-monaco-editor";
import Alert from "@material-ui/lab/Alert";
import InfoIcon from "@material-ui/icons/Info";
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

const yaml = require("js-yaml");

const useStyles = makeStyles((theme) => ({
  tooltip: {
    fontSize: "1rem"
  },
  tooltipIcon: {
    fontSize: "1.5rem",
    marginRight: "1rem"
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
    const timeoutId = setTimeout(async () => {
      await createAndValidateDeploymentData(editedManifest, "TEST_DSEQ_VALIDATION");
    }, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedManifest]);

  async function createAndValidateDeploymentData(yamlStr, dseq = null, deposit = defaultInitialDeposit) {
    try {
      if (!editedManifest) return null;

      const doc = yaml.load(yamlStr);
      const dd = await NewDeploymentData(settings.apiEndpoint, doc, dseq, address, deposit);
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

  const onDeploymentDeposit = async (deposit) => {
    setIsDepositingDeployment(false);
    await handleCreateClick(deposit);
  };

  async function handleCreateClick(deposit) {
    setIsCreatingDeployment(true);
    const dd = await createAndValidateDeploymentData(editedManifest, null, deposit);

    if (!dd) return;

    try {
      const message = TransactionMessageData.getCreateDeploymentMsg(dd);
      const response = await sendTransaction([message]);

      if (response) {
        saveDeploymentManifestAndName(dd.deploymentId.dseq, editedManifest, dd.version, address, deploymentName);

        history.push("/createDeployment/acceptBids/" + dd.deploymentId.dseq);

        await analytics.event("deploy", "create deployment");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsCreatingDeployment(false);
    }
  }

  function handleChangeTemplate() {
    history.push("/createDeployment/chooseTemplate");
  }

  return (
    <>
      <Helmet title="Create Deployment - Manifest Edit" />

      <Box padding="1rem" paddingTop={0}>
        <Box marginBottom=".5rem" display="flex" alignItems="center" justifyContent="space-between">
          <Button onClick={handleChangeTemplate}>Change Template</Button>
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
              {isCreatingDeployment ? <CircularProgress size="24px" color="primary" /> : "Create Deployment"}
            </Button>
          </Box>
        </Box>

        <div>
          <TextField
            value={deploymentName}
            onChange={(ev) => setDeploymentName(ev.target.value)}
            fullWidth
            label="Name your deployment (optional)"
            variant="outlined"
          />
        </div>
      </Box>

      {parsingError && <Alert severity="warning">{parsingError}</Alert>}

      <ViewPanel bottomElementId="footer" overflow="hidden">
        <MonacoEditor language="yaml" theme="vs-dark" value={editedManifest} onChange={handleTextChange} options={monacoOptions} />
      </ViewPanel>

      <DeploymentDepositModal
        isDepositingDeployment={isDepositingDeployment}
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
              Escrow accounts are a mechanism that allow for time-based payments from one bank account to another without block-by-block micropayments. If your
              escrow account runs out, your deployment will automatically close. You can still add more funds to your deployment escrow once it's created.
            </Typography>
          </Alert>
        }
      />
    </>
  );
}
