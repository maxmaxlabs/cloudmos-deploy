import React, { useEffect, useState } from "react";
import { getDeploymentLocalData } from "../../shared/utils/deploymentLocalDataUtils";

const LocalNoteProviderContext = React.createContext({});

export const LocalNoteProvider = ({ children }) => {
  // const updateSettings = (settings) => {
  //   localStorage.setItem("settings", JSON.stringify(settings));
  //   setSettings(settings);
  // };

  const getDeploymentName = (dseq) => {
    const localData = getDeploymentLocalData(dseq);

    if(localData){
      return localData.name;
    }
    
    return null;
  };

  return <LocalNoteProviderContext.Provider value={{ getDeploymentName }}>{children}</LocalNoteProviderContext.Provider>;
};

export const useLocalNotes = () => {
  const { getDeploymentName } = React.useContext(LocalNoteProviderContext);

  return { getDeploymentName };
};
