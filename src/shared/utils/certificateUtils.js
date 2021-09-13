import rs from "jsrsasign";

export const generateCertificate = (address, password) => {
  const notBefore = new Date();
  let notAfter = new Date();
  notAfter.setFullYear(notBefore.getFullYear() + 1);

  const notBeforeStr = dateToStr(notBefore);
  const notAfterStr = dateToStr(notAfter);

  // STEP1. generate a key pair
  const kp = rs.KEYUTIL.generateKeypair("EC", "secp256r1");
  const prv = kp.prvKeyObj;
  const pub = kp.pubKeyObj;
  // var prvpem = rs.KEYUTIL.getPEM(prv, "PKCS8PRV");

  const encryptedKey = rs.KEYUTIL.getPEM(prv, "PKCS8PRV", password);

  const pubpem = rs.KEYUTIL.getPEM(pub, "PKCS8PUB").replaceAll("PUBLIC KEY", "EC PUBLIC KEY");

  // STEP2. specify certificate parameters
  const cert = new rs.KJUR.asn1.x509.Certificate({
    version: 3,
    serial: { int: Math.floor(new Date().getTime() * 1000) },
    issuer: { str: "/CN=" + address },
    notbefore: notBeforeStr,
    notafter: notAfterStr,
    subject: { str: "/CN=" + address },
    //subjectAltName: {array: [{oid: "2.23.133.2.6", value: "v0.0.1"}]},
    sbjpubkey: pub, // can specify public key object or PEM string
    ext: [
      { extname: "keyUsage", critical: true, names: ["keyEncipherment", "dataEncipherment"] },
      {
        extname: "extKeyUsage",
        array: [{ name: "clientAuth" }]
      },
      { extname: "basicConstraints", cA: true, critical: true }
    ],
    sigalg: "SHA256withECDSA",
    cakey: prv // can specify private key object or PEM string
  });

  const crtpem = cert.getPEM();

  return { cert, crtpem, pubpem, encryptedKey };
};

function dateToStr(date) {
  const year = date.getUTCFullYear().toString().substring(2).padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const secs = date.getUTCSeconds().toString().padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${secs}Z`;
}
