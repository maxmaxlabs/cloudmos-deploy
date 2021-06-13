import React, { useState } from "react";

const defaultRpcEndpoint = "http://rpc.akash.forbole.com";
const defaultApiEndpoint = "http://135.181.60.250:1317";

const SettingsProviderContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ apiEndpoint: defaultApiEndpoint, rpcEndpoint: defaultRpcEndpoint });

  return <SettingsProviderContext.Provider value={{ settings, setSettings }}>{children}</SettingsProviderContext.Provider>;
};

export const useSettings = () => {
  const { settings, setSettings } = React.useContext(SettingsProviderContext);

  return { settings, setSettings };
};
