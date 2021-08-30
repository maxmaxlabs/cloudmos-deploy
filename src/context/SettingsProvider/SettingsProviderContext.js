import React, { useEffect, useState } from "react";
import axios from "axios";
import { mainNet } from "../../shared/contants";

const SettingsProviderContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ apiEndpoint: "", rpcEndpoint: "", isCustomNode: false, nodes: {} });

  // load settings from localStorage or set default values
  useEffect(() => {
    const initiateSettings = async () => {
      const settingsStr = localStorage.getItem("settings");
      const settings = JSON.parse(settingsStr);

      if (settingsStr && settings.nodes) {
        setSettings(settings);
      } else {
        // Set the available nodes list and default endpoints
        const apiNodes = await axios.get(`${mainNet}/api-nodes.txt`);
        const rpcNodes = await axios.get(`${mainNet}/rpc-nodes.txt`);
        const _apiNodes = apiNodes.data
          .split("\n")
          .filter((x) => x)
          .map((node) => new URL(node));
        const _rpcNodes = rpcNodes.data
          .split("\n")
          .filter((x) => x)
          .map((node) => new URL(node));
        const nodes = {};

        _apiNodes.forEach((node) => {
          nodes[node.hostname] = {
            api: node.port
          };
        });

        _rpcNodes.forEach((node) => {
          if (nodes[node.hostname]) {
            nodes[node.hostname].rpc = node.port;
          }
        });

        // Set first one as default
        const firstKey = Object.keys(nodes)[0];
        const defaultApiNode = `http://${firstKey}:${nodes[firstKey].api}`;
        const defaultRpcNode = `http://${firstKey}:${nodes[firstKey].rpc}`;

        setSettings({ apiEndpoint: defaultApiNode, rpcEndpoint: defaultRpcNode, nodes });
      }
    };

    initiateSettings();
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
