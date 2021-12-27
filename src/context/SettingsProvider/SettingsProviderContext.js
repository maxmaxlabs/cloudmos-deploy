import React, { useEffect, useState } from "react";
import axios from "axios";
import { mainNetNodes } from "../../shared/contants";
import { queryClient } from "../../queries";

const SettingsProviderContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ apiEndpoint: "", rpcEndpoint: "", isCustomNode: false, nodes: [], selectedNode: null });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isRefreshingNodeStatus, setIsRefreshingNodeStatus] = useState(false);

  // load settings from localStorage or set default values
  useEffect(() => {
    const initiateSettings = async () => {
      setIsLoadingSettings(true);

      const settingsStr = localStorage.getItem("settings");
      const settings = JSON.parse(settingsStr) || {};
      let defaultApiNode, defaultRpcNode, selectedNode;

      // Set the available nodes list and default endpoints
      const response = await axios.get(mainNetNodes);
      let nodes = response.data;

      const hasSettings =
        settingsStr && settings.apiEndpoint && settings.rpcEndpoint && settings.selectedNode && nodes.find((x) => x.id === settings.selectedNode.id);

      // if user has settings locally
      if (hasSettings) {
        nodes = nodes.map(async (node) => {
          const nodeStatus = await loadNodeStatus(node.api);

          return {
            ...node,
            status: nodeStatus.status,
            latency: nodeStatus.latency,
            nodeInfo: nodeStatus.nodeInfo
          };
        });

        defaultApiNode = settings.apiEndpoint;
        defaultRpcNode = settings.rpcEndpoint;
        selectedNode = settings.selectedNode;

        updateSettings({ ...settings, apiEndpoint: defaultApiNode, rpcEndpoint: defaultRpcNode, selectedNode });
        setIsLoadingSettings(false);

        // update the node statuses asynchronously
        nodes = await Promise.all(nodes);

        updateSettings({ ...settings, nodes });
      } else {
        nodes = await Promise.all(
          nodes.map(async (node) => {
            const nodeStatus = await loadNodeStatus(node.api);

            return {
              ...node,
              status: nodeStatus.status,
              latency: nodeStatus.latency,
              nodeInfo: nodeStatus.nodeInfo
            };
          })
        );

        // Set fastest one as default
        const randomNode = getFastestNode(nodes);
        defaultApiNode = randomNode.api;
        defaultRpcNode = randomNode.rpc;
        selectedNode = randomNode;

        updateSettings({ ...settings, apiEndpoint: defaultApiNode, rpcEndpoint: defaultRpcNode, selectedNode, nodes });
        setIsLoadingSettings(false);
      }
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
    const filteredNodes = nodes.filter((n) => n.status === "active");
    let lowest = Number.POSITIVE_INFINITY,
      fastestNode;

    // No active node, return the first one
    if (filteredNodes.length === 0) {
      return nodes[0];
    }

    filteredNodes.forEach((node) => {
      if (node.latency < lowest) {
        lowest = node.latency;
        fastestNode = node;
      }
    });

    return fastestNode;
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
      let nodes = settings.nodes;

      nodes = await Promise.all(
        nodes.map(async (node) => {
          const nodeStatus = await loadNodeStatus(node.api);

          return {
            ...node,
            status: nodeStatus.status,
            latency: nodeStatus.latency,
            nodeInfo: nodeStatus.nodeInfo
          };
        })
      );

      setIsRefreshingNodeStatus(false);

      const selectedNode = nodes.find((node) => node.id === settings.selectedNode.id);

      updateSettings({ ...settings, nodes, selectedNode });

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
