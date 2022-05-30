import { DirectSecp256k1HdWallet, extractKdfConfiguration } from "@cosmjs/proto-signing";
import { stringToPath } from "@cosmjs/crypto";

// default cosmojs KdfConfiguration
const basicPasswordHashingOptions = {
  algorithm: "argon2id",
  params: {
    outputLength: 32,
    opsLimit: 24,
    memLimitKib: 12 * 1024
  }
};

export const useStorageWallets = () => {
  const wallets = getWallets();

  return { wallets };
};

export function getSelectedWallet() {
  const wallets = getWallets();

  return wallets.find((w) => w.selected) || wallets[0] || {};
}

export function getWallets() {
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  const wallets = JSON.parse(localStorage.getItem(`${selectedNetworkId}/wallets`));

  return wallets || [];
}

export function updateWallet(address, func) {
  const wallets = getWallets();
  let wallet = wallets.find((w) => w.address === address);
  wallet = func(wallet);

  const newWallets = wallets.map((w) => (w.address === address ? wallet : w));
  updateStorageWallets(newWallets);
}

export function updateStorageWallets(wallets) {
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  localStorage.setItem(`${selectedNetworkId}/wallets`, JSON.stringify(wallets));
}

export function deleteWalletFromStorage(address, deleteDeployments) {
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  const wallets = getWallets();
  const newWallets = wallets.filter((w) => w.address !== address);

  updateStorageWallets(newWallets);

  if (deleteDeployments) {
    const deploymentKeys = Object.keys(localStorage).filter((key) => key.startsWith(`${selectedNetworkId}/${address}/deployments/`));
    for (const deploymentKey of deploymentKeys) {
      localStorage.removeItem(deploymentKey);
    }
  }
}

export async function generateNewWallet(numberOfWords, password) {
  const wallet = await DirectSecp256k1HdWallet.generate(numberOfWords, {
    prefix: "akash",
    bip39Password: password
  });
  return wallet;
}

export async function importWallet(mnemonic, name, password, account = 0, change = 0, addressIndex = 0) {
  // default cosmos path: m/44'/118'/0'/0/0'
  const path = stringToPath(`m/44'/118'/${account}'/${change}/${addressIndex}`);
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "akash",
    hdPaths: [path]
  });

  const key = await window.electron.executeKdf(password, basicPasswordHashingOptions);
  const keyArray = Uint8Array.of(...Object.values(key));

  const serializedWallet = await wallet.serializeWithEncryptionKey(keyArray, basicPasswordHashingOptions);
  const address = (await wallet.getAccounts())[0].address;
  const wallets = getWallets();

  if (wallets.some((w) => w.address === address)) {
    throw new Error("This wallet is already imported.");
  }

  const newWallets = wallets
    .concat([
      {
        name,
        address,
        serializedWallet
      }
    ])
    .map((w) => ({ ...w, selected: w.address === address }));
  updateStorageWallets(newWallets);

  wallet.name = name;
  wallet.selected = true;
  wallet.address = address;

  return wallet;
}

export async function validateWallets(password) {
  const storageWallets = getWallets();
  let wallets = [];

  for (let i = 0; i < storageWallets.length; i++) {
    const selectedWallet = storageWallets[i];

    const kdfConf = extractKdfConfiguration(selectedWallet.serializedWallet);

    const key = await window.electron.executeKdf(password, kdfConf);
    const keyArray = Uint8Array.of(...Object.values(key));

    const wallet = await DirectSecp256k1HdWallet.deserializeWithEncryptionKey(selectedWallet.serializedWallet, keyArray);

    wallet.name = selectedWallet.name;
    wallet.selected = selectedWallet.selected;
    wallet.address = selectedWallet.address;

    wallets.push(wallet);
  }

  return wallets;
}

export async function openWallet(password) {
  const selectedWallet = getSelectedWallet();

  const kdfConf = extractKdfConfiguration(selectedWallet.serializedWallet);

  const key = await window.electron.executeKdf(password, kdfConf);
  const keyArray = Uint8Array.of(...Object.values(key));

  const wallet = await DirectSecp256k1HdWallet.deserializeWithEncryptionKey(selectedWallet.serializedWallet, keyArray);
  wallet.name = selectedWallet.name;

  return wallet;
}

export function useSelectedWalletFromStorage() {
  return getSelectedWallet();
}

export function updateLocalStorageWalletName(address, name) {
  updateWallet(address, (wallet) => {
    return { ...wallet, name };
  });
}
