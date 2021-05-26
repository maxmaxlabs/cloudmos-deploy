import { useState, useEffect } from "react";
import './App.css';
import { MemoryRouter, Route } from "react-router-dom";
import { DeployTool } from "./DeployTool";
import WalletImport from './WalletImport';
import WalletOpen from "./WalletOpen";
import { PasswordConfirmationModalProvider } from "./ConfirmPasswordModal/ConfirmPasswordModalContext";

function App() {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [cert, setCert] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    async function getAddress() {
      const [account] = await selectedWallet.getAccounts();
      setAddress(account.address);
    }
    if (selectedWallet) {
      getAddress();
    }
  }, [selectedWallet]);

  const walletExists = localStorage.getItem("Wallet") !== null;

  function handleWalletOpen(wallet, cert) {
    setSelectedWallet(wallet);
    setCert(cert);
  }

  return (
    <PasswordConfirmationModalProvider>
      <MemoryRouter
        initialEntries={["/"]}
        initialIndex={1}
      >
        {/* <Route exact path="/walletImport">
          <WalletImport />
        </Route> */}
        <Route exact path="/">
          {selectedWallet && address ? (
            <DeployTool selectedWallet={selectedWallet} address={address} cert={cert} />
          ) : (
            walletExists ?
              <WalletOpen onWalletOpen={handleWalletOpen} />
              : <WalletImport onWalletOpen={handleWalletOpen} />
          )}
        </Route>
      </MemoryRouter>
    </PasswordConfirmationModalProvider>
  );
}

export default App;
