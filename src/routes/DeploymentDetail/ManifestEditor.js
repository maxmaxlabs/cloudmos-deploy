import { useEffect, useState } from "react";
import { Button, Box, Typography, Tooltip, makeStyles } from "@material-ui/core";
import { getDeploymentLocalData, saveDeploymentManifest } from "../../shared/utils/deploymentLocalDataUtils";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { sendManifestToProvider } from "../../shared/utils/deploymentUtils";
import { deploymentData } from "../../shared/deploymentData";
import { useWallet } from "../../context/WalletProvider";
import { useTransactionModal } from "../../context/TransactionModal";
import { useCertificate } from "../../context/CertificateProvider";
import MonacoEditor from "react-monaco-editor";
import Alert from "@material-ui/lab/Alert";
import { useSettings } from "../../context/SettingsProvider";
import { useSnackbar } from "notistack";
import { analytics } from "../../shared/utils/analyticsUtils";
import { useProviders } from "../../queries";
import { ManifestErrorSnackbar } from "../../shared/components/ManifestErrorSnackbar";
import { LinkTo } from "../../shared/components/LinkTo";
import InfoIcon from "@material-ui/icons/Info";
import { ViewPanel } from "../../shared/components/ViewPanel";
import { monacoOptions } from "../../shared/constants";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";

const yaml = require("js-yaml");

export const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: "bold",
    marginLeft: ".5rem"
  },
  tooltip: {
    fontSize: "1rem",
    padding: ".5rem"
  },
  tooltipIcon: {
    fontSize: "1.5rem",
    marginLeft: "1rem",
    color: theme.palette.text.secondary
  }
}));

export function ManifestEditor({ deployment, leases, closeManifestEditor }) {
  const [parsingError, setParsingError] = useState(null);
  const [editedManifest, setEditedManifest] = useState("");
  const [isSendingManifest, setIsSendingManifest] = useState(false);
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

  /**
   * Validate the manifest periodically
   */
  useEffect(() => {
    async function createAndValidateDeploymentData(yamlStr, dseq) {
      try {
        if (!editedManifest) return null;

        const doc = yaml.load(yamlStr);

        await deploymentData.NewDeploymentData(settings.apiEndpoint, doc, dseq, address);

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

  function handleTextChange(value) {
    setEditedManifest(value);
  }

  function handleUpdateDocClick(ev) {
    ev.preventDefault();

    window.electron.openUrl("https://docs.akash.network/guides/cli/part-11.-update-the-deployment");
  }

  async function sendManifest(providerInfo, manifest) {
    try {
      const response = await sendManifestToProvider(providerInfo, manifest, deployment.dseq, localCert);

      return response;
    } catch (err) {
      enqueueSnackbar(<ManifestErrorSnackbar err={err} />, { variant: "error", autoHideDuration: null });
      throw err;
    }
  }

  async function handleUpdateClick() {
    const doc = yaml.load(editedManifest);
    const dd = await deploymentData.NewDeploymentData(settings.apiEndpoint, doc, parseInt(deployment.dseq), address); // TODO Flags
    const mani = deploymentData.Manifest(doc);

    try {
      const message = TransactionMessageData.getUpdateDeploymentMsg(dd);
      const response = await sendTransaction([message]);

      if (response) {
        setIsSendingManifest(true);

        saveDeploymentManifest(dd.deploymentId.dseq, editedManifest, dd.version, address);

        const leaseProviders = leases.map((lease) => lease.provider).filter((v, i, s) => s.indexOf(v) === i);

        for (const provider of leaseProviders) {
          const providerInfo = providers.find((x) => x.owner === provider);
          await sendManifest(providerInfo, mani);
        }

        await analytics.event("deploy", "update deployment");

        setIsSendingManifest(false);

        closeManifestEditor();
      }
    } catch (error) {
      setIsSendingManifest(false);
      throw error;
    }
  }

  return (
    <>
      {showOutsideDeploymentMessage ? (
        <Box padding=".5rem">
          <Alert severity="info">
            It looks like this deployment was created using another deploy tool. We can't show you the configuration file that was used initially, but you can
            still update it. Simply continue and enter the configuration you want to use.
            <Box mt={1}>
              <Button variant="contained" color="primary" onClick={() => setShowOutsideDeploymentMessage(false)} size="small">
                Continue
              </Button>
            </Box>
          </Alert>
        </Box>
      ) : (
        <>
          <div>
            <Box display="flex" alignItems="center" justifyContent="space-between" padding=".2rem .5rem" height="45px">
              <Box display="flex" alignItems="center">
                <Typography variant="h6" className={classes.title}>
                  Update Manifest
                </Typography>

                <Tooltip
                  classes={{ tooltip: classes.tooltip }}
                  arrow
                  interactive
                  title={
                    <Alert severity="info">
                      Akash Groups are translated into Kubernetes Deployments, this means that only a few fields from the Akash SDL are mutable. For example
                      image, command, args, env and exposed ports can be modified, but compute resources and placement criteria cannot. (
                      <LinkTo onClick={handleUpdateDocClick}>View doc</LinkTo>)
                    </Alert>
                  }
                >
                  <InfoIcon className={classes.tooltipIcon} />
                </Tooltip>
              </Box>

              <Box>
                {!localCert || !isLocalCertMatching ? (
                  <Alert severity="warning">You do not have a valid certificate. You need to create a new one to update an existing deployment.</Alert>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={!!parsingError || !editedManifest || !providers || isSendingManifest || deployment.state !== "active"}
                    onClick={() => handleUpdateClick()}
                  >
                    Update Deployment
                  </Button>
                )}
              </Box>
            </Box>

            {parsingError && <Alert severity="warning">{parsingError}</Alert>}

            <LinearLoadingSkeleton isLoading={isSendingManifest} />

            <ViewPanel bottomElementId="footer" overflow="hidden">
              <MonacoEditor language="yaml" theme="vs-dark" value={editedManifest} onChange={handleTextChange} options={monacoOptions} />
            </ViewPanel>
          </div>
        </>
      )}
    </>
  );
}
