import { useState, useCallback } from "react";
import { makeStyles, Box } from "@material-ui/core";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { usePasswordConfirmationModal } from "../../context/ConfirmPasswordModal";
import { useTransactionModal } from "../../context/TransactionModal";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import RefreshIcon from "@material-ui/icons/Refresh";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import WarningIcon from "@material-ui/icons/Warning";
import { Button, IconButton, Card, CardHeader, Tooltip, CircularProgress, MenuItem, Menu } from "@material-ui/core";
import { useCertificate } from "../../context/CertificateProvider";
import { useWallet } from "../../context/WalletProvider";

var rs = require("jsrsasign");

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    minHeight: 104,
    height: "100%",
    borderRadius: 0,
    border: "none",
    "& .MuiCardHeader-subheader": {
      alignItems: "center",
      display: "flex"
    }
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  tooltip: {
    fontSize: "16px"
  }
});

export function CertificateDisplay() {
  const { certificate, isLocalCertMatching, isLoadingCertificates, loadValidCertificates, loadLocalCert } = useCertificate();
  const classes = useStyles();
  const { askForPasswordConfirmation } = usePasswordConfirmationModal();
  const { sendTransaction } = useTransactionModal();
  const { address } = useWallet();

  const revokeCertificate = useCallback(async () => {
    handleClose();

    try {
      const message = TransactionMessageData.getRevokeCertificateMsg(address, certificate.serial);

      const response = await sendTransaction([message]);

      if (response) {
        localStorage.removeItem(address + ".crt");
        localStorage.removeItem(address + ".key");

        await loadValidCertificates();
      }
    } catch (error) {
      throw error;
    }
  }, [certificate]);

  function dateToStr(date) {
    const year = date.getUTCFullYear().toString().substring(2).padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const secs = date.getUTCSeconds().toString().padStart(2, "0");

    return `${year}${month}${day}${hours}${minutes}${secs}Z`;
  }

  async function createCertificate() {
    const password = await askForPasswordConfirmation();
    if (!password) {
      console.log("cancelled");
      return;
    }

    const notBefore = new Date();
    let notAfter = new Date();
    notAfter.setFullYear(notBefore.getFullYear() + 1);

    const notBeforeStr = dateToStr(notBefore);
    const notAfterStr = dateToStr(notAfter);

    // STEP1. generate a key pair
    var kp = rs.KEYUTIL.generateKeypair("EC", "secp256r1");
    var prv = kp.prvKeyObj;
    var pub = kp.pubKeyObj;
    // var prvpem = rs.KEYUTIL.getPEM(prv, "PKCS8PRV");

    var encryptedKey = rs.KEYUTIL.getPEM(prv, "PKCS8PRV", password);

    var pubpem = rs.KEYUTIL.getPEM(pub, "PKCS8PUB").replaceAll("PUBLIC KEY", "EC PUBLIC KEY");

    // STEP2. specify certificate parameters
    var cert = new rs.KJUR.asn1.x509.Certificate({
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

    try {
      const message = TransactionMessageData.getCreateCertificateMsg(address, crtpem, pubpem);
      const response = await sendTransaction([message]);

      if (response) {
        localStorage.setItem(address + ".crt", crtpem);
        localStorage.setItem(address + ".key", encryptedKey);

        loadValidCertificates();
        loadLocalCert(address, password);
      }
    } catch (error) {
      throw error;
    }
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
        <CardHeader
          action={
            certificate && (
              <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
            )
          }
          title={
            <Box display="flex" alignItems="center">
              <VerifiedUserIcon />
              <Box component="span" marginLeft="5px">
                Certificate
              </Box>
              <Box marginLeft="1rem">
                <IconButton onClick={() => loadValidCertificates(true)} aria-label="refresh" disabled={isLoadingCertificates}>
                  {isLoadingCertificates ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
                </IconButton>
              </Box>
              {!isLoadingCertificates && !certificate && (
                <Box marginLeft="1rem">
                  <Button variant="contained" color="primary" size="small" onClick={() => createCertificate()}>
                    Create Certificate
                  </Button>
                </Box>
              )}
            </Box>
          }
          subheader={
            <>
              {certificate && "Serial: " + certificate.serial}

              {certificate && !isLocalCertMatching && (
                <Tooltip
                  title="Add"
                  classes={classes}
                  arrow
                  title="The local cert doesn't match the one on the blockchain. You can revoke it and create a new one."
                >
                  <WarningIcon className="certMismatchWarning" />
                </Tooltip>
              )}
            </>
          }
        ></CardHeader>
        {certificate && (
          <Menu
            id="cert-menu"
            anchorEl={anchorEl}
            keepMounted
            getContentAnchorEl={null}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right"
            }}
          >
            <MenuItem onClick={() => revokeCertificate()}>
              <DeleteForeverIcon />
              &nbsp;Revoke
            </MenuItem>
          </Menu>
        )}
      </Card>
    </>
  );
}
