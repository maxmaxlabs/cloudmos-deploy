import { useState } from "react";
import MonacoEditor from 'react-monaco-editor';

const yaml = require('js-yaml');

export function ManifestEdit(props) {

  const { editedManifest, setEditedManifest } = props;

  function handleTextChange(value) {

    try{

    }catch(err){
      
    }

    setEditedManifest(value);
  }

  const options = {
    selectOnLineNumbers: true,
    minimap: {
      enabled: false
    }
  };

  return (
    <>
      <MonacoEditor
        height="600"
        language="yaml"
        theme="vs-dark"
        value={editedManifest}
        onChange={value => setEditedManifest(value)}
        options={options}
      />
    </>
  )
}