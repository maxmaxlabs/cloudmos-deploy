import { useState, useEffect } from "react";
import './App.css';
import { MemoryRouter, Route } from "react-router-dom";
import { DeployTool } from "./DeployTool";
import WalletImport from './WalletImport';
import WalletOpen from "./WalletOpen";

function App() {
  const [selectedWallet, setSelectedWallet] = useState(null);
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

  return (
    <MemoryRouter
      initialEntries={["/"]}
      initialIndex={1}
    >
      {/* <Route exact path="/walletImport">
          <WalletImport />
        </Route> */}
      <Route exact path="/">
        {selectedWallet && address ? (
          <DeployTool selectedWallet={selectedWallet} address={address} />
        ) : (
          walletExists ?
            <WalletOpen onWalletOpen={wallet => setSelectedWallet(wallet)} />
            : <WalletImport onWalletOpen={wallet => setSelectedWallet(wallet)} />
        )}
      </Route>
    </MemoryRouter>
  );
}

export default App;
