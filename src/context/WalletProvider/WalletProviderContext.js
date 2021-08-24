import { useSnackbar } from "notistack";
import React, { useState, useCallback, useEffect } from "react";
import { useSettings } from "../SettingsProvider";
import { Snackbar } from "../../shared/components/Snackbar";
import { deleteWalletFromStorage } from "../../shared/utils/walletUtils";
import { useHistory } from "react-router-dom";

const WalletProviderContext = React.createContext({});

export const WalletProvider = ({ children }) => {
  const { settings } = useSettings();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const refreshBalance = useCallback(
    async (showSnackbar) => {
      setIsRefreshingBalance(true);

      const response = await fetch(settings.apiEndpoint + "/cosmos/bank/v1beta1/balances/" + address);
      const data = await response.json();
      const balance = (() => {
        for (let i of data.balances) {
          if (i.denom === "uakt") {
            return i.amount;
          }
        }
        return 0;
      })();
      setBalance(balance);
      setIsRefreshingBalance(false);

      if (showSnackbar) {
        enqueueSnackbar(<Snackbar title="Balance refreshed!" />, { variant: "success" });
      }

      return balance;
    },
    [address]
  );

  const deleteWallet = useCallback(() => {
    deleteWalletFromStorage(address);
    setSelectedWallet(null);
    history.push("/");
  }, [address]);

  useEffect(() => {
    async function getAddress() {
      const [account] = await selectedWallet.getAccounts();
      setAddress(account.address);
    }
    if (selectedWallet) {
      getAddress();
    } else {
      setAddress(null);
    }
  }, [selectedWallet]);

  useEffect(() => {
    if (address) {
      refreshBalance();
    }
  }, [address, refreshBalance]);

  return (
    <WalletProviderContext.Provider value={{ balance, setSelectedWallet, refreshBalance, selectedWallet, address, isRefreshingBalance, deleteWallet }}>
      {children}
    </WalletProviderContext.Provider>
  );
};

export const useWallet = () => {
  return { ...React.useContext(WalletProviderContext) };
};
