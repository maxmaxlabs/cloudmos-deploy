import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export async function importWallet(mnemonic, passphrase) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "akash"
  });

  const serializedWallet = await wallet.serialize(passphrase)
  localStorage.setItem("Wallet", serializedWallet);

  return wallet;
}

export async function openWallet(password) {
  const encryptedWallet = localStorage.getItem("Wallet");
  const wallet = await DirectSecp256k1HdWallet.deserialize(encryptedWallet, password);

  return wallet;
}