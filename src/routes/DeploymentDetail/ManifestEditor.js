import { useEffect, useState } from "react";
import { Button, Box, Typography } from "@material-ui/core";
import { getDeploymentLocalData, saveDeploymentManifest } from "../../shared/utils/deploymentLocalDataUtils";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { NewDeploymentData, Manifest, sendManifestToProvider } from "../../shared/utils/deploymentUtils";
import { useWallet } from "../../context/WalletProvider";
import { useTransactionModal } from "../../context/TransactionModal";
import { useCertificate } from "../../context/CertificateProvider";
import MonacoEditor from "react-monaco-editor";
import Alert from "@material-ui/lab/Alert";
import { useStyles } from "./ManifestEditor.styles";
import { useSettings } from "../../context/SettingsProvider";
import { useSnackbar } from "notistack";
import { analytics } from "../../shared/utils/analyticsUtils";
import { useProviders } from "../../queries";

const yaml = require("js-yaml");

export function ManifestEditor({ deployment, leases, closeManifestEditor }) {
  const [parsingError, setParsingError] = useState(null);
  const [editedManifest, setEditedManifest] = useState("");
  const [showOutsideDeploymentMessage, setShowOutsideDeploymentMessage] = useState(false);
  const { settings } = useSettings();
  const classes = useStyles();
  const { address } = useWallet();
  const { localCert, isLocalCertMatching } = useCertificate();
  const { sendTransaction } = useTransactionModal();
  const { enqueueSnackbar } = useSnackbar();
  const { data: providers } = useProviders();

  useEffect(() => {
    const deploymentData = getDeploymentLocalData(deployment.dseq);
    setEditedManifest(deploymentData?.manifest);

    if (!deploymentData) {
      setShowOutsideDeploymentMessage(true);
    }
  }, [deployment]);

  async function handleTextChange(value) {
    setEditedManifest(value);
  }

  useEffect(() => {
    async function createAndValidateDeploymentData(yamlStr, dseq) {
      try {
        if (!editedManifest) return null;

        const doc = yaml.load(yamlStr);

        await NewDeploymentData(settings.apiEndpoint, doc, dseq, address);

        setParsingError(null);
      } catch (err) {
        if (err.name === "YAMLException" || err.name === "CustomValidationError") {
          setParsingError(err.message);
        } else {
          setParsingError("Error while parsing SDL file");
          console.error(err);
        }
      }
    }

    const timeoutId = setTimeout(async () => {
      await createAndValidateDeploymentData(editedManifest, deployment.dseq);
    }, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [editedManifest, deployment.dseq, settings.apiEndpoint, address]);

  function handleUpdateDocClick(ev) {
    ev.preventDefault();

    window.electron.openUrl("https://docs.akash.network/guides/cli#part-11.-update-the-deployment");
  }

  const options = {
    selectOnLineNumbers: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false
    }
  };

  async function sendManifest(providerInfo, mani) {
    try {
      const response = await sendManifestToProvider(providerInfo, mani, deployment.dseq, localCert);

      return response;
    } catch (err) {
      enqueueSnackbar(`Error while sending manifest to provider. ${err}`, { variant: "error", autoHideDuration: null });
      throw err;
    }
  }

  async function handleUpdateClick() {
    const doc = yaml.load(editedManifest);

    const dd = await NewDeploymentData(settings.apiEndpoint, doc, parseInt(deployment.dseq), address); // TODO Flags
    const mani = Manifest(doc);

    try {
      const message = TransactionMessageData.getUpdateDeploymentMsg(dd);

      const response = await sendTransaction([message]);

      if (response) {
        saveDeploymentManifest(dd.deploymentId.dseq, editedManifest, dd.version, address);

        const leaseProviders = leases.map((lease) => lease.provider).filter((v, i, s) => s.indexOf(v) === i);

        for (const provider of leaseProviders) {
          const providerInfo = providers.find((x) => x.owner === provider);
          await sendManifest(providerInfo, mani);
        }

        await analytics.event("deploy", "update deployment");

        closeManifestEditor();
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <>
      <Typography variant="h6" className={classes.title}>
        Update Manifest
      </Typography>

      {showOutsideDeploymentMessage ? (
        <Box mt={1}>
          <Alert severity="info">
            It looks like this deployment was created using another deploy tool. We can't show you the configuration file that was used initially, but you can
            still update it. Simply continue and enter the configuration you want to use.
            <Box mt={1}>
              <Button variant="contained" color="primary" onClick={() => setShowOutsideDeploymentMessage(false)}>
                Continue
              </Button>
            </Box>
          </Alert>
        </Box>
      ) : (
        <>
          <Box pb={2}>
            <Alert severity="info">
              Akash Groups are translated into Kubernetes Deployments, this means that only a few fields from the Akash SDL are mutable. For example image,
              command, args, env and exposed ports can be modified, but compute resources and placement criteria cannot. (
              <a href="!#" onClick={handleUpdateDocClick}>
                View doc
              </a>
              )
            </Alert>
            <br />
            <MonacoEditor height="600" language="yaml" theme="vs-dark" value={editedManifest} onChange={handleTextChange} options={options} />
          </Box>
          {parsingError && <Alert severity="warning">{parsingError}</Alert>}

          <Box pt={2}>
            {!localCert || !isLocalCertMatching ? (
              <Alert severity="warning">You do not have a valid certificate. You need to create a new one to update an existing deployment.</Alert>
            ) : (
              <Button variant="contained" color="primary" disabled={!!parsingError || !editedManifest || !providers} onClick={() => handleUpdateClick()}>
                Update Deployment
              </Button>
            )}
          </Box>
        </>
      )}
    </>
  );
}
