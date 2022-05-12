import React, { useState, useEffect } from "react";
import { getDeploymentLocalData } from "../../shared/utils/deploymentLocalDataUtils";
import { DeploymentNameModal } from "./DeploymentNameModal";
import { updateProviderLocalData } from "../../shared/utils/providerUtils";
import { getProviderLocalData } from "../../shared/utils/providerUtils";

const LocalNoteProviderContext = React.createContext({});

export const LocalNoteProvider = ({ children }) => {
  const [dseq, setDseq] = useState(null);
  const [favoriteProviders, setFavoriteProviders] = useState([]);

  useEffect(() => {
    const localProviderData = getProviderLocalData();
    setFavoriteProviders(localProviderData.favorites);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFavoriteProviders = (newFavorites) => {
    updateProviderLocalData({ favorites: newFavorites });
    setFavoriteProviders(newFavorites);
  }

  const getDeploymentName = (dseq) => {
    const localData = getDeploymentLocalData(dseq);

    if (localData) {
      return localData.name;
    }

    return null;
  };

  const getDeploymentData = (dseq) => {
    const localData = getDeploymentLocalData(dseq);

    if (localData) {
      return localData;
    }

    return null;
  };

  const changeDeploymentName = (dseq) => {
    setDseq(dseq);
  };

  return (
    <LocalNoteProviderContext.Provider value={{ getDeploymentName, changeDeploymentName, getDeploymentData, favoriteProviders, updateFavoriteProviders }}>
      <DeploymentNameModal dseq={dseq} onClose={() => setDseq(null)} onSaved={() => setDseq(null)} getDeploymentName={getDeploymentName} />
      {children}
    </LocalNoteProviderContext.Provider>
  );
};

export const useLocalNotes = () => {
  return { ...React.useContext(LocalNoteProviderContext) };
};
