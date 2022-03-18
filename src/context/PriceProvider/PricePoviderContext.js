import React, { useState, useCallback, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import axios from "axios";

const PriceProviderContext = React.createContext({});

export const PriceProvider = ({ children }) => {
  const [priceData, setPriceData] = useState({});
  const [isLoadingPriceData, setIsLoadingPriceData] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const loadPriceData = useCallback(async () => {
    if (isLoadingPriceData) return;

    setIsLoadingPriceData(true);

    try {
      const endpointUrl = "https://api.coingecko.com/api/v3/coins/akash-network";

      console.log("Fetching latest market data from " + endpointUrl);

      const response = await axios.get(endpointUrl);
      const data = response.data;

      const aktMarketData = {
        price: parseFloat(data.market_data.current_price.usd),
        volume: parseInt(data.market_data.total_volume.usd),
        marketCap: parseInt(data.market_data.market_cap.usd),
        marketCapRank: data.market_cap_rank,
        priceChange24h: parseFloat(data.market_data.price_change_24h),
        priceChangePercentage24: parseFloat(data.market_data.price_change_percentage_24h)
      };

      setPriceData(aktMarketData);
    } catch (error) {
      console.log(error);

      setIsLoadingPriceData(false);
      // enqueueSnackbar(<Snackbar title="Error loading price data." />, { variant: "error" });
    }
  }, [enqueueSnackbar, isLoadingPriceData]);

  useEffect(() => {
    loadPriceData();
    const priceDataIntervalId = setInterval(async () => {
      await loadPriceData();
    }, 300_000); // refresh every 5 min

    return () => {
      clearInterval(priceDataIntervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PriceProviderContext.Provider value={{ priceData, isLoadingPriceData, loadPriceData }}>{children}</PriceProviderContext.Provider>;
};

export const usePrice = () => {
  return { ...React.useContext(PriceProviderContext) };
};
