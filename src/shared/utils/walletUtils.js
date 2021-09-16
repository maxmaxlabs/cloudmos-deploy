import { DirectSecp256k1HdWallet, extractKdfConfiguration } from "@cosmjs/proto-signing";

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
  return Object.keys(localStorage)
    .filter((key) => key.endsWith(".wallet"))
    .map((key) => key.replace(".wallet", ""));
}

export function deleteWalletFromStorage(address, deleteDeployments) {
  localStorage.removeItem(address + ".wallet");
  localStorage.removeItem(address + ".crt");
  localStorage.removeItem(address + ".key");

  if (deleteDeployments) {
    const deploymentKeys = Object.keys(localStorage).filter((key) => key.startsWith("deployments/"));
    for (const deploymentKey of deploymentKeys) {
      localStorage.removeItem(deploymentKey);
    }
  }
}

export async function importWallet(mnemonic, name, password) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "akash"
  });

  const key = await window.electron.executeKdf(password, basicPasswordHashingOptions);
  const keyArray = Uint8Array.of(...Object.values(key));

  const serializedWallet = await wallet.serializeWithEncryptionKey(keyArray, basicPasswordHashingOptions);
  const address = (await wallet.getAccounts())[0].address;

  localStorage.setItem(
    address + ".wallet",
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
  const walletInfo = JSON.parse(localStorage.getItem(walletAddress + ".wallet"));

  const kdfConf = extractKdfConfiguration(walletInfo.serializedWallet);

  const key = await window.electron.executeKdf(password, kdfConf);
  const keyArray = Uint8Array.of(...Object.values(key));

  const wallet = await DirectSecp256k1HdWallet.deserializeWithEncryptionKey(walletInfo.serializedWallet, keyArray);

  return wallet;
}

export function getCurrentWalletFromStorage() {
  const walletAddress = getWalletAddresses()[0];
  const walletInfo = JSON.parse(localStorage.getItem(walletAddress + ".wallet"));

  return walletInfo;
}
