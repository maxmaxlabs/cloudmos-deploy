import React, { useState, useCallback, useEffect } from "react";
import { apiEndpoint } from "../shared/constants";

const WalletProviderContext = React.createContext({});

export const WalletProvider = ({ children }) => {
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

  return (
    <WalletProviderContext.Provider value={{ balance, setSelectedWallet, refreshBalance, selectedWallet, address }}>
      {children}
    </WalletProviderContext.Provider>
  );
};

export const useWallet = () => {
  const { balance, setSelectedWallet, refreshBalance, selectedWallet, address } = React.useContext(WalletProviderContext);

  return { balance, setSelectedWallet, refreshBalance, selectedWallet, address };
};
