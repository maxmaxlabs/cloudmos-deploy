import { useState, useEffect } from "react";

export const useAppVersion = () => {
  const [appVersion, setAppVersion] = useState(null);

  useEffect(() => {
    setAppVersion(window.electron.getAppVersion());
  }, []);

  return {
    appVersion
  };
};
