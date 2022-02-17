export const mainnetNodes = "https://raw.githubusercontent.com/Akashlytics/akashlytics-deploy/master/mainnet-nodes.json";
export const testnetNodes = "https://raw.githubusercontent.com/Akashlytics/akashlytics-deploy/master/testnet-nodes.json";
export const edgenetNodes = "https://raw.githubusercontent.com/Akashlytics/akashlytics-deploy/master/edgenet-nodes.json";

export const mainnetId = "mainnet";
export const testnetId = "testnet";
export const edgenetId = "edgenet";

export const transactionLink = (txHash) => `https://www.mintscan.io/akash/txs/${txHash}`;

// UI
export const statusBarHeight = 30;
export const accountBarHeight = 58;

export const monacoOptions = {
  selectOnLineNumbers: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  scrollbar: {
    verticalScrollbarSize: "8px"
  },
  minimap: {
    enabled: false
  },
  padding: {
    bottom: 50
  }
};
