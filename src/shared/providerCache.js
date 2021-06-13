let providerCache = [];

export const fetchProviderInfo = async (apiEndpoint, providerAddress) => {
  if (providerAddress in providerCache) {
    return providerCache[providerAddress];
  }
  
  const response = await fetch(apiEndpoint + "/akash/provider/v1beta1/providers/" + providerAddress);
  const data = await response.json();

  providerCache[providerAddress] = data.provider;

  return data.provider;
};
