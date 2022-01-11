import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { mainnetNodes } from "../../shared/constants";
import { initiateNetworkData } from "../../shared/networks";
import { queryClient } from "../../queries";

const SettingsProviderContext = React.createContext({});

const defaultSettings = {
  apiEndpoint: "",
  rpcEndpoint: "",
  isCustomNode: false,
  nodes: [],
  selectedNode: null,
  customNode: null
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isRefreshingNodeStatus, setIsRefreshingNodeStatus] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState(parseInt(localStorage.getItem("selectedNetworkId")) || 1);

  // load settings from localStorage or set default values
  useEffect(() => {
    const initiateSettings = async () => {
      setIsLoadingSettings(true);

      // Set the versions and metadata of available networks
      await initiateNetworkData();

      const settingsStr = localStorage.getItem("settings");
      const settings = { ...defaultSettings, ...JSON.parse(settingsStr) } || {};
      let defaultApiNode, defaultRpcNode, selectedNode;

      // Set the available nodes list and default endpoints
      const response = await axios.get(mainnetNodes);
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

        let customNode;

        if (settings.isCustomNode) {
          const nodeStatus = await loadNodeStatus(settings.apiEndpoint);
          const customNodeUrl = new URL(settings.apiEndpoint);

          customNode = {
            status: nodeStatus.status,
            latency: nodeStatus.latency,
            nodeInfo: nodeStatus.nodeInfo,
            id: customNodeUrl.hostname
          };
        }

        updateSettings({ ...settings, apiEndpoint: defaultApiNode, rpcEndpoint: defaultRpcNode, selectedNode, customNode });
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
    setSettings((prevSettings) => {
      clearQueries(prevSettings, newSettings);
      localStorage.setItem("settings", JSON.stringify(newSettings));

      return newSettings;
    });
  };

  const clearQueries = (prevSettings, newSettings) => {
    if (prevSettings.apiEndpoint !== newSettings.apiEndpoint || (prevSettings.isCustomNode && !newSettings.isCustomNode)) {
      // Cancel and remove queries from cache if the api endpoint is changed
      queryClient.resetQueries();
      queryClient.cancelQueries();
      queryClient.removeQueries();
      queryClient.clear();
    }
  };

  /**
   * Refresh the nodes status and latency
   * @returns
   */
  const refreshNodeStatuses = useCallback(
    async (isCustomNode, forceRefresh) => {
      if (isRefreshingNodeStatus && !forceRefresh) return;

      setIsRefreshingNodeStatus(true);
      let nodes = settings.nodes;
      let customNode = settings.customNode;
      const _isCustomNode = typeof isCustomNode === "boolean" ? isCustomNode : settings.isCustomNode;

      if (_isCustomNode) {
        const nodeStatus = await loadNodeStatus(settings.apiEndpoint);
        const customNodeUrl = new URL(settings.apiEndpoint);

        customNode = {
          status: nodeStatus.status,
          latency: nodeStatus.latency,
          nodeInfo: nodeStatus.nodeInfo,
          id: customNodeUrl.hostname
        };
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
      }

      setIsRefreshingNodeStatus(false);

      // Update the settings with callback to avoid stale state settings
      setSettings((prevSettings) => {
        const selectedNode = nodes.find((node) => node.id === prevSettings.selectedNode.id);

        const newSettings = {
          ...prevSettings,
          nodes,
          selectedNode,
          customNode
        };

        clearQueries(prevSettings, newSettings);
        localStorage.setItem("settings", JSON.stringify(newSettings));

        return newSettings;
      });
    },
    [settings?.selectedNode?.id, settings?.isCustomNode, isRefreshingNodeStatus]
  );

  return (
    <SettingsProviderContext.Provider
      value={{ settings, setSettings: updateSettings, isLoadingSettings, refreshNodeStatuses, isRefreshingNodeStatus, selectedNetworkId, setSelectedNetworkId }}
    >
      {children}
    </SettingsProviderContext.Provider>
  );
};

export const useSettings = () => {
  return { ...React.useContext(SettingsProviderContext) };
};
