import React, { useState, useCallback, useEffect } from "react";
import { apiEndpoint } from "../shared/constants";
import { openCert } from "../walletHelper";

const CertificateProviderContext = React.createContext({});

export const CertificateProvider = ({ address, children }) => {
  const [validCertificates, setValidCertificates] = useState([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
  const [localCert, setLocalCert] = useState(null);
  const [isLocalCertMatching, setIsLocalCertMatching] = useState(false);

  const loadValidCertificates = useCallback(async () => {
    setIsLoadingCertificates(true);
    const response = await fetch(apiEndpoint + "/akash/cert/v1beta1/certificates/list?filter.state=valid&filter.owner=" + address);
    const data = await response.json();

    setValidCertificates(data.certificates);
    setIsLoadingCertificates(false);
console.log(data.certificates[0]);
    return data.certificates[0];
  }, [address]);

  useEffect(() => {
    if (address) {
      loadValidCertificates();
    }
  }, [address, loadValidCertificates]);

  const loadLocalCert = async (address, password) => {
    const cert = await openCert(address, password);
    console.log(cert);
    setLocalCert(cert);
  }

  const certificate = validCertificates[0];

  useEffect(() => {
    let isMatching = false;
    if(certificate && localCert){
      isMatching = atob(certificate.certificate.cert) === localCert.certPem;
    }
    setIsLocalCertMatching(isMatching);
  }, [certificate, localCert])

  return (
    <CertificateProviderContext.Provider value={{ loadValidCertificates, certificate, isLoadingCertificates, loadLocalCert, localCert, isLocalCertMatching }}>
      {children}
    </CertificateProviderContext.Provider>
  );
};

export const useCertificate = () => {
  const { loadValidCertificates, certificate, isLoadingCertificates, loadLocalCert, localCert, isLocalCertMatching } = React.useContext(CertificateProviderContext);

  return { loadValidCertificates, certificate, isLoadingCertificates, loadLocalCert, localCert, isLocalCertMatching };
};
