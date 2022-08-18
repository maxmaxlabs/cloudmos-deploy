export const mainnetNodes = "https://raw.githubusercontent.com/maxmaxlabs/cloudmos-deploy/master/mainnet-nodes.json";
export const testnetNodes = "https://raw.githubusercontent.com/maxmaxlabs/cloudmos-deploy/master/testnet-nodes.json";
export const edgenetNodes = "https://raw.githubusercontent.com/maxmaxlabs/cloudmos-deploy/master/edgenet-nodes.json";

export const cloudmosApi = "https://api.cloudmos.io/api";

export const mainnetId = "mainnet";
export const testnetId = "testnet";
export const edgenetId = "edgenet";

export let selectedNetworkId = "";

// 5AKT aka 5000000uakt
export const defaultInitialDeposit = 5000000;

export const transactionLink = (txHash, networkId) => {
  if (networkId === "mainnet") {
    return `https://cloudmos.io/transactions/${txHash}`;
  } else if (networkId === "edgenet") {
    return `https://testnet.akash.bigdipper.live/transactions/${txHash}`;
  }

  return null;
};

export let networkVersion;

export function setNetworkVersion() {
  const _selectedNetworkId = localStorage.getItem("selectedNetworkId");

  switch (_selectedNetworkId) {
    case mainnetId:
      networkVersion = "v1beta2";
      selectedNetworkId = mainnetId;
      break;
    case testnetId:
      networkVersion = "v1beta2";
      selectedNetworkId = testnetId;
      break;
    case edgenetId:
      networkVersion = "v1beta2";
      selectedNetworkId = edgenetId;
      break;

    default:
      networkVersion = "v1beta2";
      selectedNetworkId = mainnetId;
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
  },
  hover: {
    enabled: false
  }
};

// TODO
export const colors = {};
