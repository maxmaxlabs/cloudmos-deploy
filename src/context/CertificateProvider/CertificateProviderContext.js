import React, { useState, useCallback, useEffect } from "react";
import { openCert } from "../../shared/utils/walletUtils";
import { useSettings } from "../SettingsProvider";
import { useWallet } from "../WalletProvider";

const CertificateProviderContext = React.createContext({});

export const CertificateProvider = ({ children }) => {
  const [validCertificates, setValidCertificates] = useState([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
  const [localCert, setLocalCert] = useState(null);
  const [isLocalCertMatching, setIsLocalCertMatching] = useState(false);
  const { settings } = useSettings();

  const { address } = useWallet();

  const loadValidCertificates = useCallback(async () => {
    setIsLoadingCertificates(true);
    const response = await fetch(settings.apiEndpoint + "/akash/cert/v1beta1/certificates/list?filter.state=valid&filter.owner=" + address);
    const data = await response.json();

    setValidCertificates(data.certificates);
    setIsLoadingCertificates(false);

    return data.certificates[0];
  }, [address]);

  useEffect(() => {
    if (address) {
      loadValidCertificates();
    }
  }, [address, loadValidCertificates]);

  const loadLocalCert = async (address, password) => {
    const cert = await openCert(address, password);

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
  const { loadValidCertificates, certificate, isLoadingCertificates, loadLocalCert, localCert, isLocalCertMatching } =
    React.useContext(CertificateProviderContext);

  return { loadValidCertificates, certificate, isLoadingCertificates, loadLocalCert, localCert, isLocalCertMatching };
};
