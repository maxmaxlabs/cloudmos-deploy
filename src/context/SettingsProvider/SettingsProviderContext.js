import React, { useEffect, useState } from "react";

const defaultRpcEndpoint = "http://rpc.akash.forbole.com";
const defaultApiEndpoint = "http://135.181.60.250:1317";

const SettingsProviderContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ apiEndpoint: "", rpcEndpoint: "" });

  // load settings from localStorage or set default values
  useEffect(() => {
    const settingsStr = localStorage.getItem("settings");

    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      setSettings(settings);
    } else {
      setSettings({ apiEndpoint: defaultApiEndpoint, rpcEndpoint: defaultRpcEndpoint });
    }
  }, []);

  const updateSettings = (settings) => {
    localStorage.setItem("settings", JSON.stringify(settings));
    setSettings(settings);
  };

  return <SettingsProviderContext.Provider value={{ settings, setSettings: updateSettings }}>{children}</SettingsProviderContext.Provider>;
};

export const useSettings = () => {
  return { ...React.useContext(SettingsProviderContext) };
};
