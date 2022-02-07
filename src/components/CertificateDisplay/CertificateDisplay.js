import { useState, useCallback } from "react";
import { makeStyles, Box, Typography, Button, IconButton, Card, CardHeader, Tooltip, CircularProgress, MenuItem, Menu } from "@material-ui/core";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { usePasswordConfirmationModal } from "../../context/ConfirmPasswordModal";
import { useTransactionModal } from "../../context/TransactionModal";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import RefreshIcon from "@material-ui/icons/Refresh";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import WarningIcon from "@material-ui/icons/Warning";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import { useCertificate } from "../../context/CertificateProvider";
import { useWallet } from "../../context/WalletProvider";
import { analytics } from "../../shared/utils/analyticsUtils";
import { generateCertificate } from "../../shared/utils/certificateUtils";
import { ExportCertificate } from "./ExportCertificate";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    minHeight: 80,
    height: "100%",
    borderRadius: 0,
    border: "none",
    "& .MuiCardHeader-subheader": {
      alignItems: "center",
      display: "flex"
    }
  },
  headerAction: {
    margin: 0
  },
  headerRoot: {
    padding: "8px 16px 12px"
  },
  menuItem: {
    display: "flex",
    alignItems: "end"
  },
  menuItemText: {
    marginLeft: ".5rem"
  }
});

export function CertificateDisplay() {
  const { certificate, isLocalCertMatching, isLoadingCertificates, loadValidCertificates, loadLocalCert } = useCertificate();
  const classes = useStyles();
  const { askForPasswordConfirmation } = usePasswordConfirmationModal();
  const { sendTransaction } = useTransactionModal();
  const { address } = useWallet();
  const [isExportingCert, setIsExportingCert] = useState(false);
  const { removeLocalStorageItem, setLocalStorageItem } = useLocalStorage();
  const [anchorEl, setAnchorEl] = useState(null);

  /**
   * Revoke certificate
   */
  const revokeCertificate = useCallback(async () => {
    handleClose();

    try {
      const message = TransactionMessageData.getRevokeCertificateMsg(address, certificate.serial);

      const response = await sendTransaction([message]);

      if (response) {
        removeLocalStorageItem(address + ".crt");
        removeLocalStorageItem(address + ".key");

        await loadValidCertificates();

        await analytics.event("deploy", "revoke certificate");
      }
    } catch (error) {
      throw error;
    }
  }, [address, loadValidCertificates, removeLocalStorageItem, sendTransaction, certificate]);

  /**
   * Create certificate
   */
  async function createCertificate() {
    const password = await askForPasswordConfirmation();
    if (!password) {
      return;
    }

    const { crtpem, pubpem, encryptedKey } = generateCertificate(address, password);

    try {
      const message = TransactionMessageData.getCreateCertificateMsg(address, crtpem, pubpem);
      const response = await sendTransaction([message]);

      if (response) {
        setLocalStorageItem(address + ".crt", crtpem);
        setLocalStorageItem(address + ".key", encryptedKey);

        loadValidCertificates();
        loadLocalCert(address, password);

        await analytics.event("deploy", "create certificate");
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Regenerate certificate
   */
  async function regenerateCertificate() {
    const password = await askForPasswordConfirmation();
    if (!password) {
      return;
    }

    const { crtpem, pubpem, encryptedKey } = generateCertificate(address, password);

    try {
      const revokeCertMsg = TransactionMessageData.getRevokeCertificateMsg(address, certificate.serial);
      const createCertMsg = TransactionMessageData.getCreateCertificateMsg(address, crtpem, pubpem);
      const response = await sendTransaction([revokeCertMsg, createCertMsg]);

      if (response) {
        setLocalStorageItem(address + ".crt", crtpem);
        setLocalStorageItem(address + ".key", encryptedKey);

        loadValidCertificates();
        loadLocalCert(address, password);

        await analytics.event("deploy", "regenerate certificate");
      }
    } catch (error) {
      throw error;
    }
  }

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
          classes={{ action: classes.headerAction, root: classes.headerRoot }}
          title={
            <Box display="flex" alignItems="center">
              <VerifiedUserIcon />
              <Box component="span" marginLeft="5px">
                Certificate
              </Box>
              <Box marginLeft="1rem">
                <IconButton onClick={() => loadValidCertificates(true)} aria-label="refresh" disabled={isLoadingCertificates} size="small">
                  {isLoadingCertificates ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
                </IconButton>
              </Box>
              {certificate && (
                <Box marginLeft=".1rem">
                  <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick} size="small">
                    <MoreHorizIcon fontSize="large" />
                  </IconButton>
                </Box>
              )}
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
              {certificate && <Typography variant="caption">Serial: {certificate.serial}</Typography>}

              {certificate && !isLocalCertMatching && (
                <Tooltip
                  classes={{ tooltip: classes.tooltip }}
                  arrow
                  title="The local cert doesn't match the one on the blockchain. You can revoke it and create a new one."
                >
                  <WarningIcon fontSize="small" color="error" />
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
            onClick={handleClose}
          >
            <MenuItem onClick={() => revokeCertificate()} className={classes.menuItem}>
              <DeleteForeverIcon fontSize="small" />
              <Typography variant="body1" className={classes.menuItemText}>
                Revoke
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => regenerateCertificate()} className={classes.menuItem}>
              <AutorenewIcon fontSize="small" />
              <Typography variant="body1" className={classes.menuItemText}>
                Regenerate
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => setIsExportingCert(true)} className={classes.menuItem}>
              <GetAppIcon fontSize="small" />
              <Typography variant="body1" className={classes.menuItemText}>
                Export
              </Typography>
            </MenuItem>
          </Menu>
        )}
      </Card>

      {isExportingCert && <ExportCertificate isOpen={isExportingCert} onClose={() => setIsExportingCert(false)} />}
    </>
  );
}
