import { useSnackbar } from "notistack";
import React, { useState, useCallback, useEffect } from "react";
import { useSettings } from "../SettingsProvider";
import { Snackbar } from "../../shared/components/Snackbar";
import { deleteWalletFromStorage } from "../../shared/utils/walletUtils";
import { useHistory } from "react-router-dom";
import axios from "axios";

const WalletProviderContext = React.createContext({});

export const WalletProvider = ({ children }) => {
  const { settings } = useSettings();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const { apiEndpoint } = settings;

  const refreshBalance = useCallback(
    async (showSnackbar) => {
      if (!address) return 0;

      setIsRefreshingBalance(true);

      try {
        const response = await axios.get(`${apiEndpoint}/cosmos/bank/v1beta1/balances/${address}`);
        const data = response.data;
        const balance = data.balances.length > 0 && data.balances.some((b) => b.denom === "uakt") ? data.balances.find((b) => b.denom === "uakt").amount : 0;

        setBalance(parseInt(balance));
        setIsRefreshingBalance(false);

        if (showSnackbar) {
          enqueueSnackbar(<Snackbar title="Balance refreshed!" />, { variant: "success" });
        }

        return balance;
      } catch (error) {
        console.log(error);

        setIsRefreshingBalance(false);
        enqueueSnackbar(<Snackbar title="Error fetching balance." />, { variant: "error" });

        return 0;
      }
    },
    [address, apiEndpoint, enqueueSnackbar]
  );

  const deleteWallet = (address) => {
    deleteWalletFromStorage(address);
    setSelectedWallet(null);
    history.push("/");
  };

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
