import React, { useState } from "react";
import { getDeploymentLocalData } from "../../shared/utils/deploymentLocalDataUtils";
import { DeploymentNameModal } from "./DeploymentNameModal";

const LocalNoteProviderContext = React.createContext({});

export const LocalNoteProvider = ({ children }) => {
  const [dseq, setDseq] = useState(null);

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
    <LocalNoteProviderContext.Provider value={{ getDeploymentName, changeDeploymentName, getDeploymentData }}>
      <DeploymentNameModal dseq={dseq} onClose={() => setDseq(null)} onSaved={() => setDseq(null)} getDeploymentName={getDeploymentName} />
      {children}
    </LocalNoteProviderContext.Provider>
  );
};

export const useLocalNotes = () => {
  return { ...React.useContext(LocalNoteProviderContext) };
};
