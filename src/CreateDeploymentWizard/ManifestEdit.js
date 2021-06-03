import { useEffect, useState } from "react";
import { Box, Typography, Button } from '@material-ui/core';
import MonacoEditor from 'react-monaco-editor';
import Alert from '@material-ui/lab/Alert';

const yaml = require('js-yaml');

export function ManifestEdit(props) {
  const [parsingError, setParsingError] = useState(null);

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

  function handleCreateClick() {
    console.log("create");
    props.handleNext();
  }

  return (
    <>
      <Box pb={2}>
        <Typography>
          You may use the sample deployment file as-is or modify it for your own needs as desscribed in the <a href="#" onClick={handleDocClick}>SDL (Stack Definition Language)</a> documentation. A typical modification would be to reference your own image instead of the demo app image.
        </Typography>
        <MonacoEditor
          height="600"
          language="yaml"
          theme="vs-dark"
          value={editedManifest}
          onChange={handleTextChange}
          options={options}
        />
      </Box>
      {parsingError && <Alert severity="warning">{parsingError}</Alert>}

      <Box pt={2}>
        <Button onClick={() => props.handleBack()}>Back</Button>
        <Button variant="contained" color="primary" disabled={!!parsingError} onClick={handleCreateClick}>
            Create Deployment
        </Button>
      </Box>
    </>
  )
}