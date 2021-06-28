import { useState, useEffect, useMemo } from "react";

const ipcApi = window.electron.api;

export const useAppVersion = () => {
  const [appVersion, setAppVersion] = useState(null);

  useEffect(() => {
    setAppVersion(window.electron.getAppVersion());
  }, []);

  return {
    appVersion
  };
};
