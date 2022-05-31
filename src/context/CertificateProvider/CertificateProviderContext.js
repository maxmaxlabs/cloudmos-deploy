import React, { useState, useCallback, useEffect } from "react";
import { useSnackbar } from "notistack";
import { openCert, getCertPem } from "../../shared/utils/certificateUtils";
import { useSettings } from "../SettingsProvider";
import { useWallet } from "../WalletProvider";
import { Snackbar } from "../../shared/components/Snackbar";
import axios from "axios";
import { networkVersion } from "../../shared/constants";
import { getSelectedStorageWallet, getStorageWallets } from "../../shared/utils/walletUtils";

const CertificateProviderContext = React.createContext({});

export const CertificateProvider = ({ children }) => {
  const [validCertificates, setValidCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
  const [localCerts, setLocalCerts] = useState(null);
  const [localCert, setLocalCert] = useState(null);
  const [isLocalCertMatching, setIsLocalCertMatching] = useState(false);
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { address, selectedWallet } = useWallet();
  const { apiEndpoint } = settings;

  const loadValidCertificates = useCallback(
    async (showSnackbar) => {
      setIsLoadingCertificates(true);

      try {
        const response = await axios.get(`${apiEndpoint}/akash/cert/${networkVersion}/certificates/list?filter.state=valid&filter.owner=${address}`);
        const certs = (response.data.certificates || []).map((cert) => {
          const parsed = atob(cert.certificate.cert);
          const pem = getCertPem(parsed);

          return {
            ...cert,
            parsed,
            pem
          };
        });

        setValidCertificates(certs);
        setIsLoadingCertificates(false);

        if (showSnackbar) {
          enqueueSnackbar(<Snackbar title="Certificate refreshed!" iconVariant="success" />, { variant: "success" });
        }

        return certs;
      } catch (error) {
        console.log(error);

        setIsLoadingCertificates(false);
        enqueueSnackbar(<Snackbar title="Error fetching certificate." iconVariant="error" />, { variant: "error" });

        return [];
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, apiEndpoint, localCert, selectedCertificate]
  );

  useEffect(() => {
    if (address) {
      loadValidCertificates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    // Clear certs when no selected wallet
    if (!selectedWallet) {
      setValidCertificates([]);
      setSelectedCertificate(null);
      setLocalCert(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallet]);

  useEffect(() => {
    let isMatching = false;
    if (validCertificates?.length > 0 && localCert) {
      let currentCert = validCertificates.find((x) => x.parsed === localCert.certPem);

      if (!selectedCertificate && currentCert) {
        setSelectedCertificate(currentCert);
      } else {
        currentCert = validCertificates.find((x) => x.parsed === localCert.certPem && selectedCertificate?.serial === x.serial);
      }

      isMatching = !!currentCert;
    }

    setIsLocalCertMatching(isMatching);
  }, [selectedCertificate, localCert, validCertificates]);

  const loadLocalCert = async (password) => {
    // open certs for all the wallets to be able to switch without needing the password
    const wallets = getStorageWallets();
    const currentWallet = getSelectedStorageWallet();
    const certs = [];

    for (let i = 0; i < wallets.length; i++) {
      const _wallet = wallets[i];

      const cert = await openCert(password, _wallet.cert, _wallet.certKey);

      certs.push({ ...cert, address: _wallet.address });

      if (_wallet.address === currentWallet.address) {
        setLocalCert(cert);
      }
    }

    setLocalCerts(certs);
  };

  return (
    <CertificateProviderContext.Provider
      value={{
        loadValidCertificates,
        selectedCertificate,
        setSelectedCertificate,
        isLoadingCertificates,
        loadLocalCert,
        localCert,
        setLocalCert,
        isLocalCertMatching,
        validCertificates,
        setValidCertificates,
        localCerts,
        setLocalCerts
      }}
    >
      {children}
    </CertificateProviderContext.Provider>
  );
};

export const useCertificate = () => {
  return { ...React.useContext(CertificateProviderContext) };
};
