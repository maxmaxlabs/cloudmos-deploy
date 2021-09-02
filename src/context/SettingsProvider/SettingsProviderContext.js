import React, { useEffect, useState } from "react";
import axios from "axios";
import { mainNet } from "../../shared/contants";
import { randomInteger } from "../../shared/utils/math";
import { queryClient } from "../../queries";

const SettingsProviderContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ apiEndpoint: "", rpcEndpoint: "", isCustomNode: false, nodes: {} });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // load settings from localStorage or set default values
  useEffect(() => {
    const initiateSettings = async () => {
      setIsLoadingSettings(true);

      const settingsStr = localStorage.getItem("settings");
      const settings = JSON.parse(settingsStr) || {};
      let defaultApiNode, defaultRpcNode, selectedNodeKey;

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

      if (settingsStr && settings.apiEndpoint && settings.rpcEndpoint && settings.selectedNodeKey && nodes[settings.selectedNodeKey]) {
        defaultApiNode = settings.apiEndpoint;
        defaultRpcNode = settings.rpcEndpoint;
        selectedNodeKey = settings.selectedNodeKey;
      } else {
        // Set random one as default
        const keys = Object.keys(nodes);
        const randomNodeKey = keys[randomInteger(0, keys.length - 1)];
        defaultApiNode = `http://${randomNodeKey}:${nodes[randomNodeKey].api}`;
        defaultRpcNode = `http://${randomNodeKey}:${nodes[randomNodeKey].rpc}`;
        selectedNodeKey = randomNodeKey;
      }

      updateSettings({ ...settings, apiEndpoint: defaultApiNode, rpcEndpoint: defaultRpcNode, selectedNodeKey, nodes });
      setIsLoadingSettings(false);
    };

    initiateSettings();
  }, []);

  const updateSettings = (newSettings) => {
    if (settings.apiEndpoint !== newSettings.apiEndpoint || (settings.isCustomNode && !newSettings.isCustomNode)) {
      // Cancel and remove queries from cache if the api endpoint is changed
      queryClient.cancelQueries();
      queryClient.removeQueries();
      console.log("invalidated queries");
    }

    localStorage.setItem("settings", JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  return <SettingsProviderContext.Provider value={{ settings, setSettings: updateSettings, isLoadingSettings }}>{children}</SettingsProviderContext.Provider>;
};

export const useSettings = () => {
  return { ...React.useContext(SettingsProviderContext) };
};
