import { useState, useEffect, useMemo } from "react";

const ipcApi = window.electron.api;

export const useAppVersion = () => {
  const [appVersion, setAppVersion] = useState(null);

  useEffect(() => {
    ipcApi.send("app_version");
    ipcApi.receive("app_version", (arg) => {
      console.log("App version:", arg.version);
      setAppVersion(arg.version);
    });
  }, []);

  return {
    appVersion
  };
};
