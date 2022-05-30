import { useState } from "react";
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
import CreateIcon from "@material-ui/icons/Create";
import { useCertificate } from "../../context/CertificateProvider";
import { useWallet } from "../../context/WalletProvider";
import { analytics } from "../../shared/utils/analyticsUtils";
import { generateCertificate } from "../../shared/utils/certificateUtils";
import { ExportCertificate } from "./ExportCertificate";
import GetAppIcon from "@material-ui/icons/GetApp";
import { accountBarHeight } from "../../shared/constants";
import { CustomMenuItem } from "../../shared/components/CustomMenuItem";
import { LinkTo } from "../../shared/components/LinkTo";
import { CertificateListModal } from "./CertificateListModal";
import { updateWallet } from "../../shared/utils/walletUtils";

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
  const [isExportingCert, setIsExportingCert] = useState(false);
  const [isShowingCertificates, setIsShowingCertificates] = useState(false);
  const { selectedCertificate, isLocalCertMatching, isLoadingCertificates, loadValidCertificates, loadLocalCert, localCert, setSelectedCertificate } =
    useCertificate();
  const classes = useStyles();
  const { askForPasswordConfirmation } = usePasswordConfirmationModal();
  const { sendTransaction } = useTransactionModal();
  const { address } = useWallet();
  const [anchorEl, setAnchorEl] = useState(null);

  /**
   * Revoke certificate
   */
  const revokeCertificate = async (certificate) => {
    handleClose();

    try {
      const message = TransactionMessageData.getRevokeCertificateMsg(address, certificate.serial);

      const response = await sendTransaction([message]);

      if (response) {
        const validCerts = await loadValidCertificates();
        const isRevokingOtherCert = validCerts.some((c) => c.parsed === localCert.certPem);

        updateWallet(address, (wallet) => {
          return {
            ...wallet,
            cert: isRevokingOtherCert ? wallet.cert : undefined,
            certKey: isRevokingOtherCert ? wallet.certKey : undefined
          };
        });

        if (validCerts?.length > 0 && certificate.serial === selectedCertificate.serial) {
          setSelectedCertificate(validCerts[0]);
        } else if (validCerts?.length === 0) {
          setSelectedCertificate(null);
        }

        await analytics.event("deploy", "revoke certificate");
      }
    } catch (error) {
      throw error;
    }
  };

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
        updateWallet(address, (wallet) => {
          return {
            ...wallet,
            cert: crtpem,
            certKey: encryptedKey
          };
        });

        const validCerts = await loadValidCertificates();
        loadLocalCert(password);

        const currentCert = validCerts.find((x) => x.parsed === crtpem);

        setSelectedCertificate(currentCert);

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
      const revokeCertMsg = TransactionMessageData.getRevokeCertificateMsg(address, selectedCertificate.serial);
      const createCertMsg = TransactionMessageData.getCreateCertificateMsg(address, crtpem, pubpem);
      const response = await sendTransaction([revokeCertMsg, createCertMsg]);

      if (response) {
        updateWallet(address, (wallet) => {
          return {
            ...wallet,
            cert: crtpem,
            certKey: encryptedKey
          };
        });

        const validCerts = await loadValidCertificates();
        loadLocalCert(password);

        const currentCert = validCerts.find((x) => x.parsed === crtpem);

        setSelectedCertificate(currentCert);

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
          {selectedCertificate && (
            <Box marginLeft=".2rem">
              <IconButton aria-label="settings" aria-haspopup="true" onClick={handleMenuClick} size="small">
                <MoreHorizIcon />
              </IconButton>
            </Box>
          )}
          {!isLoadingCertificates && !selectedCertificate && (
            <Box marginLeft="1rem">
              <Button variant="contained" color="primary" size="small" onClick={() => createCertificate()}>
                Create Certificate
              </Button>
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center">
          {selectedCertificate && (
            <LinkTo onClick={() => setIsShowingCertificates(true)}>
              <Typography variant="caption" color="textSecondary">
                Serial: {selectedCertificate.serial}
              </Typography>
            </LinkTo>
          )}

          {selectedCertificate && !isLocalCertMatching && (
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

      {selectedCertificate && (
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
          {/** If local, regenerate else create */}
          {selectedCertificate.parsed === localCert?.certPem ? (
            <CustomMenuItem onClick={() => regenerateCertificate()} icon={<AutorenewIcon fontSize="small" />} text="Regenerate" />
          ) : (
            <CustomMenuItem onClick={() => createCertificate()} icon={<CreateIcon fontSize="small" />} text="Create" />
          )}

          <CustomMenuItem onClick={() => revokeCertificate(selectedCertificate)} icon={<DeleteForeverIcon fontSize="small" />} text="Revoke" />
          <CustomMenuItem onClick={() => setIsExportingCert(true)} icon={<GetAppIcon fontSize="small" />} text="Export" />
        </Menu>
      )}

      {isExportingCert && <ExportCertificate isOpen={isExportingCert} onClose={() => setIsExportingCert(false)} />}
      {isShowingCertificates && <CertificateListModal onClose={() => setIsShowingCertificates(false)} revokeCertificate={revokeCertificate} />}
    </>
  );
}
