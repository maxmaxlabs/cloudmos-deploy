import React from "react";
import MonacoEditor from "react-monaco-editor";
import isEqual from "lodash/isEqual";

export const MemoMonaco = React.memo(
  function MemoMonaco({ value, monacoRef, options }) {
    return <MonacoEditor ref={monacoRef} theme="vs-dark" value={value} options={options} />;
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  }
);
