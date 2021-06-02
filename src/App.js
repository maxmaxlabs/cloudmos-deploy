import { useState, useEffect, useCallback } from "react";
import './App.css';
import { apiEndpoint } from "./shared/constants";
import { PasswordConfirmationModalProvider } from "./ConfirmPasswordModal/ConfirmPasswordModalContext";
import { MainView } from "./MainView";
import { CertificateProvider } from "./CertificateProvider/CertificateProviderContext";

function App() {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  const refreshBalance = useCallback(async () => {
    const response = await fetch(apiEndpoint + "/cosmos/bank/v1beta1/balances/" + address);
    const data = await response.json();
    const balance = data.balances.length > 0 ? data.balances[0].amount : 0;
    setBalance(balance);

    return balance;
  }, [address])

  useEffect(() => {
    async function getAddress() {
      const [account] = await selectedWallet.getAccounts();
      setAddress(account.address);
    }
    if (selectedWallet) {
      getAddress();
    }
  }, [selectedWallet]);

  useEffect(() => {
    if (address) {
      refreshBalance();
    }
  }, [address, refreshBalance]);

  function handleWalletOpen(wallet) {
    setSelectedWallet(wallet);
  }

  return (
    <PasswordConfirmationModalProvider>
      <CertificateProvider address={address}>
        <MainView handleWalletOpen={handleWalletOpen} balance={balance} refreshBalance={refreshBalance} selectedWallet={selectedWallet} address={address} />
      </CertificateProvider>
    </PasswordConfirmationModalProvider>
  );
}

export default App;
