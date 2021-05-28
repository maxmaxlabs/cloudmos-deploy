import { useEffect, useState } from "react";
import { Box } from '@material-ui/core';
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

  useEffect(() => {
    props.setIsNextDisabled(!!parsingError)
  }, [parsingError]);

  const options = {
    selectOnLineNumbers: true,
    minimap: {
      enabled: false
    }
  };

  return (
    <>
    <Box pb={2}>
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
    </>
  )
}