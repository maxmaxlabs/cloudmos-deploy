import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

var rs = require("jsrsasign");

export async function importWallet(mnemonic, passphrase) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: "akash"
  });

  const serializedWallet = await wallet.serialize(passphrase);
  localStorage.setItem("Wallet", serializedWallet);

  return wallet;
}

export async function openWallet(password) {
  const encryptedWallet = localStorage.getItem("Wallet");
  const wallet = await DirectSecp256k1HdWallet.deserialize(encryptedWallet, password);

  return wallet;
}

export async function openCert(address, password) {
  const certPem = localStorage.getItem(address + ".crt");
  if (!certPem) return null;

  const encryptedKeyPem = localStorage.getItem(address + ".key");

  if (!encryptedKeyPem) return null;

  const key = rs.KEYUTIL.getKeyFromEncryptedPKCS8PEM(encryptedKeyPem, password);

  return {
    certPem: certPem,
    keyPem: rs.KEYUTIL.getPEM(key, "PKCS8PRV")
  };
}
