export const mainnetNodes = "https://raw.githubusercontent.com/Akashlytics/akashlytics-deploy/master/mainnet-nodes.json";
export const testnetNodes = "https://raw.githubusercontent.com/Akashlytics/akashlytics-deploy/master/testnet-nodes.json";
export const edgenetNodes = "https://raw.githubusercontent.com/Akashlytics/akashlytics-deploy/master/edgenet-nodes.json";

export const akashlyticsApi = "https://api.akashlytics.com/api"

export const mainnetId = "mainnet";
export const testnetId = "testnet";
export const edgenetId = "edgenet";

// 5AKT aka 5000000uakt
export const defaultInitialDeposit = 5000000;

export const transactionLink = (txHash, networkId) => {
  if (networkId === "mainnet") {
    return `https://www.mintscan.io/akash/txs/${txHash}`;
  } else if (networkId === "edgenet") {
    return `https://testnet.akash.bigdipper.live/transactions/${txHash}`;
  }

  return null;
};

export let networkVersion;

export function setNetworkVersion() {
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");

  switch (selectedNetworkId) {
    case mainnetId:
      networkVersion = "v1beta2";
      break;
    case testnetId:
      networkVersion = "v1beta2";
      break;
    case edgenetId:
      networkVersion = "v1beta2";
      break;

    default:
      networkVersion = "v1beta2";
      break;
  }
}

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
