import React, { useState, useCallback, useEffect } from "react";
import { useSnackbar } from "notistack";
import { openCert, getCertPem } from "../../shared/utils/certificateUtils";
import { useSettings } from "../SettingsProvider";
import { useWallet } from "../WalletProvider";
import { Snackbar } from "../../shared/components/Snackbar";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import axios from "axios";
import { networkVersion } from "../../shared/constants";

const CertificateProviderContext = React.createContext({});

export const CertificateProvider = ({ children }) => {
  const [validCertificates, setValidCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
  const [localCert, setLocalCert] = useState(null);
  const [isLocalCertMatching, setIsLocalCertMatching] = useState(false);
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { address } = useWallet();
  const { getLocalStorageItem } = useLocalStorage();
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

        return "Certificate error.";
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, apiEndpoint, localCert, selectedCertificate]
  );

  useEffect(() => {
    if (address) {
      loadValidCertificates();
    }
  }, [address, loadValidCertificates]);

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

  const loadLocalCert = async (address, password) => {
    const certPem = getLocalStorageItem(address + ".crt");
    const encryptedKeyPem = getLocalStorageItem(address + ".key");

    const cert = await openCert(password, certPem, encryptedKeyPem);

    setLocalCert(cert);
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
        isLocalCertMatching,
        validCertificates
      }}
    >
      {children}
    </CertificateProviderContext.Provider>
  );
};

export const useCertificate = () => {
  return { ...React.useContext(CertificateProviderContext) };
};
