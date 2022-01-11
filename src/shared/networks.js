import { mainnetNodes, testnetNodes, edgenetNodes } from "./constants";
import axios from "axios";

export let networks = [
  {
    id: 1,
    title: "Mainnet",
    description: "Akash Network mainnet network.",
    nodesUrl: mainnetNodes,
    chainId: "akashnet-2",
    versionUrl: "https://raw.githubusercontent.com/ovrclk/net/master/mainnet/version.txt",
    version: null // Set asynchronously
  },
  {
    id: 2,
    title: "Testnet",
    description: "Testnet of the current mainnet version.",
    nodesUrl: testnetNodes,
    chainId: "testnet-1",
    versionUrl: "https://raw.githubusercontent.com/ovrclk/net/master/testnet/version.txt",
    version: null // Set asynchronously
  },
  {
    id: 3,
    title: "Edgenet",
    description: "Testnet of the next mainnet version.",
    nodesUrl: edgenetNodes,
    chainId: "edgenet-1",
    versionUrl: "https://raw.githubusercontent.com/ovrclk/net/master/edgenet/version.txt",
    version: null // Set asynchronously
  }
];

export const initiateNetworkData = async () => {
  networks = await Promise.all(
    networks.map(async (network) => {
      let version = null;
      try {
        const response = await axios.get(network.versionUrl, { timeout: 10000 });
        version = response.data;
      } catch (error) {
        console.log(error);
      }

      return {
        ...network,
        version
      };
    })
  );
};
