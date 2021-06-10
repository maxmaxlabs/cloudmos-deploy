import { useEffect, useState } from "react";
import { Button, Box, Typography } from "@material-ui/core";
import { getDeploymentLocalData, saveDeploymentManifest } from "../../shared/utils/deploymentLocalDataUtils";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { NewDeploymentData, Manifest } from "../../shared/utils/deploymentUtils";
import { useWallet } from "../../context/WalletProvider";
import { useTransactionModal } from "../../context/TransactionModal";
import { useCertificate } from "../../context/CertificateProvider";
import MonacoEditor from "react-monaco-editor";
import Alert from "@material-ui/lab/Alert";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { fetchProviderInfo } from "../../shared/providerCache";

const stableStringify = require("json-stable-stringify");
const yaml = require("js-yaml");

export function ManifestEditor({ deployment, leases, closeManifestEditor }) {
  const [parsingError, setParsingError] = useState(null);
  const [editedManifest, setEditedManifest] = useState("");

  const { address } = useWallet();
  const { localCert } = useCertificate();
  const { sendTransaction } = useTransactionModal();

  useEffect(() => {
    const deploymentData = getDeploymentLocalData(deployment.dseq);
    setEditedManifest(deploymentData.manifest);
  }, [deployment]);

  function handleTextChange(value) {
    try {
      yaml.load(value);
      setParsingError(null);
    } catch (err) {
      if (err.name === "YAMLException") {
        setParsingError(err.message);
      } else {
        throw err;
      }
    }

    setEditedManifest(value);
  }

  function handleSDLDocClick(ev) {
    ev.preventDefault();

    window.electron.openUrl("https://docs.akash.network/documentation/sdl");
  }

  function handleUpdateDocClick(ev) {
    ev.preventDefault();

    window.electron.openUrl("https://docs.akash.network/guides/deploy#update-your-deployment");
  }

  const options = {
    selectOnLineNumbers: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false
    }
  };

  async function sendManifest(providerInfo, mani) {
    console.log("Sending manifest to " + providerInfo.address);
    const response = await window.electron.queryProvider(
      providerInfo.host_uri + "/deployment/" + deployment.dseq + "/manifest",
      "PUT",
      JSON.stringify(mani, (key, value) => {
        if (key === "storage" || key === "memory") {
          let newValue = { ...value };
          newValue.size = newValue.quantity;
          delete newValue.quantity;
          return newValue;
        }
        return value;
      }),
      localCert.certPem,
      localCert.keyPem
    );

    return response;
  }

  async function handleUpdateClick() {
    const doc = yaml.load(editedManifest);

    const dd = await NewDeploymentData(doc, parseInt(deployment.dseq), address); // TODO Flags
    const mani = Manifest(doc);
    
    try {
      const message = TransactionMessageData.getUpdateDeploymentMsg(dd);
      // TODO handle response
      const response = await sendTransaction([message]);

      if(!response) throw "Failed";
    } catch (error) {
      throw error;
    }
    
    saveDeploymentManifest(dd.deploymentId.dseq, editedManifest, dd.version);

    const providers = leases.map((lease) => lease.provider).filter((v, i, s) => s.indexOf(v) === i);

    for (const provider of providers) {
      const providerInfo = await fetchProviderInfo(provider);
      const response = await sendManifest(providerInfo, mani);
    }

    closeManifestEditor();
  }

  return (
    <>
      <Box pb={2}>
        <Alert severity="info">
          Akash Groups are translated into Kubernetes Deployments, this means that only a few fields from the Akash SDL are mutable. For example image, command,
          args, env and exposed ports can be modified, but compute resources and placement criteria cannot. (
          <a href="#" onClick={handleUpdateDocClick}>
            View doc
          </a>
          )
        </Alert>
        <br />
        <MonacoEditor height="600" language="yaml" theme="vs-dark" value={editedManifest} onChange={handleTextChange} options={options} />
      </Box>
      {parsingError && <Alert severity="warning">{parsingError}</Alert>}

      <Box pt={2}>
        {/* <Button onClick={() => props.handleBack()}>Back</Button> */}
        <Button variant="contained" color="primary" disabled={!!parsingError} onClick={handleUpdateClick}>
          Update Deployment
        </Button>
      </Box>
    </>
  );
}
