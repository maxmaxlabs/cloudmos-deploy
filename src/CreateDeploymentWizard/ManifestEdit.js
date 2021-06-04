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

const yaml = require("js-yaml");

export function ManifestEdit(props) {
  const [parsingError, setParsingError] = useState(null);

  const { address, selectedWallet } = useWallet();

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

    const msg = {
      id: dd.deploymentId,
      groups: dd.groups,
      version: dd.version,
      deposit: dd.deposit
    };

    const txData = {
      typeUrl: "/akash.deployment.v1beta1.MsgCreateDeployment",
      value: msg
    };

    const err = MsgCreateDeployment.verify(msg);
    // const encoded = MsgCreateDeployment.fromObject(msg);
    // const decoded = MsgCreateDeployment.toObject(encoded);

    if (err) throw err;

    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, selectedWallet, {
      registry: customRegistry
    });

    await client.signAndBroadcast(address, [txData], baseFee);

    //history.push("/createDeployment/createLease/" + )
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
