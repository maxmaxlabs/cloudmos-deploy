import { useState } from "react";
import { Box, Typography, Button } from "@material-ui/core";
import { NewDeploymentData } from "../shared/utils/deploymentUtils";
import { MsgCreateDeployment } from "../ProtoAkashTypes";
import { SigningStargateClient } from "@cosmjs/stargate";
import { customRegistry, baseFee } from "../shared/utils/blockchainUtils";
import { useWallet } from "../WalletProvider/WalletProviderContext";
import { rpcEndpoint } from "../shared/constants";
import MonacoEditor from "react-monaco-editor";
import Alert from "@material-ui/lab/Alert";
import { useHistory } from "react-router";
import { saveDeploymentManifest } from "../shared/utils/deploymentLocalDataUtils";

const yaml = require("js-yaml");

export function ManifestEdit(props) {
  const [parsingError, setParsingError] = useState(null);

  const { address, selectedWallet } = useWallet();
  const history = useHistory();

  const { editedManifest, setEditedManifest } = props;

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

  const options = {
    selectOnLineNumbers: true,
    minimap: {
      enabled: false
    }
  };

  function handleDocClick(ev) {
    ev.preventDefault();

    window.electron.openUrl("https://docs.akash.network/documentation/sdl");
  }

  async function handleCreateClick() {
    const flags = {};
    const doc = yaml.load(editedManifest);

    const dd = await NewDeploymentData(doc, flags, address); // TODO Flags

    try {
      const message = TransactionMessage.getCreateDeploymentMsg(dd);
      // TODO handle response
      const response = await sendTransaction([message]);
    } catch (error) {}

    saveDeploymentManifest(dd.deploymentId.dseq, editedManifest, dd.version);

    history.push("/createDeployment/acceptBids/" + dd.deploymentId.dseq);
  }

  return (
    <>
      <Box pb={2}>
        <Typography>
          You may use the sample deployment file as-is or modify it for your own needs as desscribed in the{" "}
          <a href="#" onClick={handleDocClick}>
            SDL (Stack Definition Language)
          </a>{" "}
          documentation. A typical modification would be to reference your own image instead of the demo app image.
        </Typography>
        <MonacoEditor height="600" language="yaml" theme="vs-dark" value={editedManifest} onChange={handleTextChange} options={options} />
      </Box>
      {parsingError && <Alert severity="warning">{parsingError}</Alert>}

      <Box pt={2}>
        <Button onClick={() => props.handleBack()}>Back</Button>
        <Button variant="contained" color="primary" disabled={!!parsingError} onClick={handleCreateClick}>
          Create Deployment
        </Button>
      </Box>
    </>
  );
}
