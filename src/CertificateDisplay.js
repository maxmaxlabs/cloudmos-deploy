import { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { SigningStargateClient } from "@cosmjs/stargate";
import { rpcEndpoint } from "./shared/constants";
import { customRegistry, baseFee } from "./shared/utils/blockchainUtils";
import { usePasswordConfirmationModal } from "./ConfirmPasswordModal/ConfirmPasswordModalContext"
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {
  Button,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  MenuItem,
  Menu
} from '@material-ui/core';
import { useCertificate } from "./CertificateProvider/CertificateProviderContext";

var rs = require("jsrsasign");

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    minHeight: 104,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export function CertificateDisplay(props) {
  const { certificate, isLoadingCertificates, loadValidCertificates } = useCertificate();
  const classes = useStyles();
  const { askForPasswordConfirmation } = usePasswordConfirmationModal();

  const { address, selectedWallet } = props;

  async function revokeCertificate(cert) {
    handleClose();

    //setIsLoadingCertificates(true);
    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, selectedWallet, {
      registry: customRegistry
    });

    const revokeCertificateJson = {
      "typeUrl": "/akash.cert.v1beta1.MsgRevokeCertificate",
      "value": {
        "id": {
          "owner": address,
          "serial": cert.serial
        }
      }
    };

    try {
      await client.signAndBroadcast(address, [revokeCertificateJson], baseFee, "Test Akashlytics");

      await loadValidCertificates();
    } finally {
      //setIsLoadingCertificates(false);
    }
  }

  function dateToStr(date) {
    const year = date.getFullYear().toString().substring(2).padStart(2, '0');
    const month = date.getMonth().toString().padStart(2, '0');
    const day = date.getDay().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const secs = date.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${secs}Z`;
  }

  async function createCertificate() {
    const password = await askForPasswordConfirmation();
    if (!password) {
      console.log("cancelled");
      return;
    }

    //setIsLoadingCertificates(true);

    const notBefore = new Date();
    let notAfter = new Date();
    notAfter.setFullYear(notBefore.getFullYear() + 1);

    const notBeforeStr = dateToStr(notBefore);
    const notAfterStr = dateToStr(notAfter);

    // STEP1. generate a key pair
    var kp = rs.KEYUTIL.generateKeypair("EC", "secp256r1");
    var prv = kp.prvKeyObj;
    var pub = kp.pubKeyObj;
    var prvpem = rs.KEYUTIL.getPEM(prv, "PKCS8PRV");

    var encryptedKey = rs.KEYUTIL.getPEM(prv, "PKCS8PRV", password);

    var pubpem = rs.KEYUTIL.getPEM(pub, "PKCS8PUB").replaceAll("PUBLIC KEY", "EC PUBLIC KEY");

    // STEP2. specify certificate parameters
    var cert = new rs.KJUR.asn1.x509.Certificate({
      version: 3,
      serial: { int: Math.floor((new Date()).getTime() * 1000) },
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
          array: [{ name: 'clientAuth' }]
        },
        { extname: "basicConstraints", cA: true, critical: true }
      ],
      sigalg: "SHA256withECDSA",
      cakey: prv // can specify private key object or PEM string
    });

    const crtpem = cert.getPEM();

    localStorage.setItem(address + ".crt", crtpem);
    localStorage.setItem(address + ".key", encryptedKey);

    const createCertificateMsg = {
      "typeUrl": "/akash.cert.v1beta1.MsgCreateCertificate",
      "value": {
        owner: address,
        cert: Buffer.from(crtpem).toString("base64"),
        pubkey: Buffer.from(pubpem).toString("base64")
      }
    }

    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, selectedWallet, {
      registry: customRegistry
    });

    await client.signAndBroadcast(address, [createCertificateMsg], baseFee, "Test Akashlytics");

    loadValidCertificates();
  }

  const [anchorEl, setAnchorEl] = useState(null);

  function handleMenuClick(ev) {
    setAnchorEl(ev.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Card className={classes.root} variant="outlined">
        <CardHeader action={
          certificate && (
            <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          )
        } title={(
          <>
            <><VerifiedUserIcon /> Certificate</>
          </>
        )} subheader={certificate && "Serial: " + certificate.serial}>
        </CardHeader>
        <CardContent>
          {isLoadingCertificates && <CircularProgress />}
          {!isLoadingCertificates && !certificate && (
            <>
              <Button variant="contained" color="primary" onClick={() => createCertificate()}>Create Certificate</Button>
            </>
          )}
        </CardContent>
        {certificate && (
          <Menu
            id="cert-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => revokeCertificate(certificate)}><DeleteForeverIcon />&nbsp;Revoke</MenuItem>
            {/* <MenuItem onClick={handleClose}><SystemUpdateAltIcon />&nbsp;Export</MenuItem> */}
            <MenuItem onClick={handleClose}><AutorenewIcon />&nbsp;Regenerate</MenuItem>
          </Menu>
        )}
      </Card>
    </>
  )
}