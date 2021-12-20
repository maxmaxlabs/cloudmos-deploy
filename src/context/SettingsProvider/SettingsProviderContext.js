import React, { useEffect, useState } from "react";
import axios from "axios";
import { mainNet } from "../../shared/contants";
import { queryClient } from "../../queries";

const SettingsProviderContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ apiEndpoint: "", rpcEndpoint: "", isCustomNode: false, nodes: {} });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isRefreshingNodeStatus, setIsRefreshingNodeStatus] = useState(false);

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

      _apiNodes.map(async (node) => {
        nodes[node.hostname] = {
          api: node.port
        };
      });

      _rpcNodes.forEach((node) => {
        if (nodes[node.hostname]) {
          nodes[node.hostname].rpc = node.port;
        }
      });

      const hasSettings = settingsStr && settings.apiEndpoint && settings.rpcEndpoint && settings.selectedNodeKey && nodes[settings.selectedNodeKey];

      // if user has settings
      if (hasSettings) {
        _apiNodes.map(async (node) => {
          const nodeStatus = await loadNodeStatus(`http://${node.hostname}:${node.port}`);

          nodes[node.hostname].status = nodeStatus.status;
          nodes[node.hostname].latency = nodeStatus.latency;
          nodes[node.hostname].nodeInfo = nodeStatus.nodeInfo;
        });

        defaultApiNode = settings.apiEndpoint;
        defaultRpcNode = settings.rpcEndpoint;
        selectedNodeKey = settings.selectedNodeKey;
      } else {
        await Promise.all(
          _apiNodes.map(async (node) => {
            const nodeStatus = await loadNodeStatus(`http://${node.hostname}:${node.port}`);

            nodes[node.hostname].status = nodeStatus.status;
            nodes[node.hostname].latency = nodeStatus.latency;
            nodes[node.hostname].nodeInfo = nodeStatus.nodeInfo;
          })
        );

        // Set fastest one as default
        const randomNodeKey = getFastestNode(nodes);
        defaultApiNode = `http://${randomNodeKey}${nodes[randomNodeKey].api ? ":" + nodes[randomNodeKey].api : ""}`;
        defaultRpcNode = `http://${randomNodeKey}${nodes[randomNodeKey].rpc ? ":" + nodes[randomNodeKey].rpc : ""}`;
        selectedNodeKey = randomNodeKey;
      }

      updateSettings({ ...settings, apiEndpoint: defaultApiNode, rpcEndpoint: defaultRpcNode, selectedNodeKey, nodes });
      setIsLoadingSettings(false);
    };

    initiateSettings();
  }, []);

  /**
   * Load the node status from node_info endpoint
   * @param {*} nodeUrl
   * @returns
   */
  const loadNodeStatus = async (nodeUrl) => {
    const start = performance.now();
    let latency,
      status = "",
      nodeInfo = {};

    try {
      const response = await axios.get(`${nodeUrl}/node_info`, { timeout: 10000 });
      nodeInfo = response.data;
      status = "active";
    } catch (error) {
      status = "inactive";
    } finally {
      const end = performance.now();
      latency = end - start;

      return {
        latency,
        status,
        nodeInfo
      };
    }
  };

  /**
   * Get the fastest node from the list based on latency
   * @param {*} nodes
   * @returns
   */
  const getFastestNode = (nodes) => {
    const nodeKeys = Object.keys(nodes).filter((n) => nodes[n].status === "active");
    let lowest = Number.POSITIVE_INFINITY,
      fastestNodeKey;

    // No active node, return the first one
    if (nodeKeys.length === 0) {
      return Object.keys(nodes)[0];
    }

    for (let i = 0; i < nodeKeys.length - 1; i++) {
      const currentNode = nodes[nodeKeys[i]];
      if (currentNode.latency < lowest) {
        lowest = currentNode.latency;
        fastestNodeKey = nodeKeys[i];
      }
    }

    return fastestNodeKey;
  };

  const updateSettings = (newSettings) => {
    if (settings.apiEndpoint !== newSettings.apiEndpoint || (settings.isCustomNode && !newSettings.isCustomNode)) {
      // Cancel and remove queries from cache if the api endpoint is changed
      queryClient.resetQueries();
      queryClient.cancelQueries();
      queryClient.removeQueries();
      queryClient.clear();
    }

    localStorage.setItem("settings", JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  /**
   * Refresh the nodes status and latency
   * @returns
   */
  const refreshNodeStatuses = async () => {
    return new Promise(async (res, rej) => {
      setIsRefreshingNodeStatus(true);
      const nodes = settings.nodes;

      await Promise.all(
        Object.keys(nodes).map(async (nodeKey) => {
          const node = nodes[nodeKey];
          const nodeStatus = await loadNodeStatus(`http://${nodeKey}${node.api ? ":" + node.api : ""}`);

          nodes[nodeKey] = {
            ...nodes[nodeKey],
            status: nodeStatus.status,
            latency: nodeStatus.latency,
            nodeInfo: nodeStatus.nodeInfo
          };
        })
      );

      setIsRefreshingNodeStatus(false);

      updateSettings({ ...settings, nodes });

      res(true);
    });
  };

  return (
    <SettingsProviderContext.Provider value={{ settings, setSettings: updateSettings, isLoadingSettings, refreshNodeStatuses, isRefreshingNodeStatus }}>
      {children}
    </SettingsProviderContext.Provider>
  );
};

export const useSettings = () => {
  return { ...React.useContext(SettingsProviderContext) };
};
