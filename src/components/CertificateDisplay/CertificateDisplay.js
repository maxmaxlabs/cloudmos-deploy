import { useState, useCallback } from "react";
import { makeStyles, Box, Typography, Button, IconButton, Tooltip, CircularProgress, Menu } from "@material-ui/core";
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
import { accountBarHeight } from "../../shared/constants";
import { CustomMenuItem } from "../../shared/components/CustomMenuItem";

const useStyles = makeStyles({
  root: {
    maxHeight: `${accountBarHeight}px`
  },
  warningIcon: {
    marginLeft: ".5rem"
  },
  tooltip: {
    fontSize: "1rem"
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
      <div className={classes.root}>
        <Box display="flex" alignItems="center">
          <VerifiedUserIcon fontSize="small" />
          <Box component="span" marginLeft="5px">
            Certificate
          </Box>
          <Box marginLeft="1rem">
            <IconButton onClick={() => loadValidCertificates(true)} aria-label="refresh" disabled={isLoadingCertificates} size="small">
              {isLoadingCertificates ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
            </IconButton>
          </Box>
          {certificate && (
            <Box marginLeft=".2rem">
              <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick} size="small">
                <MoreHorizIcon />
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

        <Box display="flex" alignItems="center">
          {certificate && (
            <Typography variant="caption" color="textSecondary">
              Serial: {certificate.serial}
            </Typography>
          )}

          {certificate && !isLocalCertMatching && (
            <Tooltip
              classes={{ tooltip: classes.tooltip }}
              arrow
              title="The local certificate doesn't match the one on the blockchain. You can revoke it and create a new one."
            >
              <WarningIcon fontSize="small" color="error" className={classes.warningIcon} />
            </Tooltip>
          )}
        </Box>
      </div>

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
          <CustomMenuItem onClick={() => revokeCertificate()} icon={<DeleteForeverIcon fontSize="small" />} text="Revoke" />
          <CustomMenuItem onClick={() => regenerateCertificate()} icon={<AutorenewIcon fontSize="small" />} text="Regenerate" />
          <CustomMenuItem onClick={() => setIsExportingCert(true)} icon={<GetAppIcon fontSize="small" />} text="Export" />
        </Menu>
      )}

      {isExportingCert && <ExportCertificate isOpen={isExportingCert} onClose={() => setIsExportingCert(false)} />}
    </>
  );
}
