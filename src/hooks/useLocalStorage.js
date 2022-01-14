export const useLocalStorage = () => {
  const getLocalStorageItem = (key) => {
    const selectedNetworkId = localStorage.getItem("selectedNetworkId");
    return localStorage.getItem(`${selectedNetworkId}/${key}`);
  };

  const setLocalStorageItem = (key, value) => {
    const selectedNetworkId = localStorage.getItem("selectedNetworkId");
    localStorage.setItem(`${selectedNetworkId}/${key}`, value);
  };

  const removeLocalStorageItem = (key) => {
    const selectedNetworkId = localStorage.getItem("selectedNetworkId");
    localStorage.removeItem(`${selectedNetworkId}/${key}`);
  };

  return {
    removeLocalStorageItem,
    setLocalStorageItem,
    getLocalStorageItem
  };
};
