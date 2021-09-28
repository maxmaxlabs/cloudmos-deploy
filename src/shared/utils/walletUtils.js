import { DirectSecp256k1HdWallet, extractKdfConfiguration } from "@cosmjs/proto-signing";
import { useCustomLocalStorage } from "../../hooks/useLocalStorage";
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

export const useStorageWalletAddresses = () => {
  const addresses = getWalletAddresses();

  return { addresses };
};

export function getWalletAddresses() {
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  return Object.keys(localStorage)
    .filter((key) => key.startsWith(selectedNetworkId) && key.endsWith(".wallet"))
    .map((key) => key.replace(".wallet", "").replace(`${selectedNetworkId}/`, ""));
}

export function deleteWalletFromStorage(address, deleteDeployments) {
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  localStorage.removeItem(`${selectedNetworkId}/${address}.wallet`);
  localStorage.removeItem(`${selectedNetworkId}/${address}.crt`);
  localStorage.removeItem(`${selectedNetworkId}/${address}.key`);

  if (deleteDeployments) {
    const deploymentKeys = Object.keys(localStorage).filter((key) => key.startsWith(`${selectedNetworkId}/deployments/`));
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

export async function createWallet(wallet) {}

export async function importWallet(mnemonic, name, password) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "akash"
  });

  const key = await window.electron.executeKdf(password, basicPasswordHashingOptions);
  const keyArray = Uint8Array.of(...Object.values(key));

  const serializedWallet = await wallet.serializeWithEncryptionKey(keyArray, basicPasswordHashingOptions);
  const address = (await wallet.getAccounts())[0].address;

  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  localStorage.setItem(
    `${selectedNetworkId}/${address}.wallet`,
    JSON.stringify({
      name: name,
      address: address,
      serializedWallet: serializedWallet
    })
  );

  return wallet;
}

export async function openWallet(password) {
  const walletAddress = getWalletAddresses()[0];
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  const walletInfo = JSON.parse(localStorage.getItem(`${selectedNetworkId}/${walletAddress}.wallet`));

  const kdfConf = extractKdfConfiguration(walletInfo.serializedWallet);

  const key = await window.electron.executeKdf(password, kdfConf);
  const keyArray = Uint8Array.of(...Object.values(key));

  const wallet = await DirectSecp256k1HdWallet.deserializeWithEncryptionKey(walletInfo.serializedWallet, keyArray);

  return wallet;
}

export function useCurrentWalletFromStorage() {
  const [selectedNetworkId] = useCustomLocalStorage("selectedNetworkId", "mainnet");
  const walletAddress = getWalletAddresses()[0];
  const [walletInfo] = useCustomLocalStorage(`${selectedNetworkId}/${walletAddress}.wallet`, "{}");

  return walletInfo;
}
