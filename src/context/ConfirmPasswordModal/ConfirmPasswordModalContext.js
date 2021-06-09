import React, { useState } from "react";
import { ConfirmPasswordModal } from "./ConfirmPasswordModal";

const PasswordConfirmationModalContext = React.createContext({});

export const PasswordConfirmationModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(null);
  
  const openModal = (options) => {
    setIsOpen(true);
    setOptions(options);
  };
  
  function handleConfirmPassword(password) {
    setIsOpen(false);
    options.actionCallback(password);
  }

  function handleClose() {
    setIsOpen(false);
    options.actionCallback(null);
  }

  return (
    <PasswordConfirmationModalContext.Provider value={{ openModal }}>
      <ConfirmPasswordModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirmPassword={handleConfirmPassword} />
      {children}
    </PasswordConfirmationModalContext.Provider>
  );
};

export const usePasswordConfirmationModal = () => {
  const { openModal } = React.useContext(PasswordConfirmationModalContext);

  const askForPasswordConfirmation = () =>
    new Promise((res) => {
      openModal({ actionCallback: res });
    });

  return { askForPasswordConfirmation };
};
