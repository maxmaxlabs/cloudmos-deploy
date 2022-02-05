import React, { useState, useCallback, useEffect } from "react";
import { useSnackbar } from "notistack";
import { openCert } from "../../shared/utils/certificateUtils";
import { useSettings } from "../SettingsProvider";
import { useWallet } from "../WalletProvider";
import { Snackbar } from "../../shared/components/Snackbar";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import axios from "axios";
import { networkVersion } from "../../shared/constants";

const CertificateProviderContext = React.createContext({});

export const CertificateProvider = ({ children }) => {
  const [validCertificates, setValidCertificates] = useState([]);
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
        const data = response.data;

        setValidCertificates(data.certificates || []);
        setIsLoadingCertificates(false);

        if (showSnackbar) {
          enqueueSnackbar(<Snackbar title="Certificate refreshed!" />, { variant: "success" });
        }

        return data.certificates[0];
      } catch (error) {
        console.log(error);

        setIsLoadingCertificates(false);
        enqueueSnackbar(<Snackbar title="Error fetching certificate." />, { variant: "error" });

        return "Certificate error.";
      }
    },
    [address, apiEndpoint, enqueueSnackbar]
  );

  useEffect(() => {
    if (address) {
      loadValidCertificates();
    } else {
      setLocalCert(null);
    }
  }, [address, loadValidCertificates]);

  const loadLocalCert = async (address, password) => {
    const certPem = getLocalStorageItem(address + ".crt");
    const encryptedKeyPem = getLocalStorageItem(address + ".key");

    const cert = await openCert(password, certPem, encryptedKeyPem);

    setLocalCert(cert);
  };

  const certificate = validCertificates[0];

  useEffect(() => {
    let isMatching = false;
    if (certificate && localCert) {
      isMatching = atob(certificate.certificate.cert) === localCert.certPem;
    }

    setIsLocalCertMatching(isMatching);
  }, [certificate, localCert]);

  return (
    <CertificateProviderContext.Provider value={{ loadValidCertificates, certificate, isLoadingCertificates, loadLocalCert, localCert, isLocalCertMatching }}>
      {children}
    </CertificateProviderContext.Provider>
  );
};

export const useCertificate = () => {
  return { ...React.useContext(CertificateProviderContext) };
};
