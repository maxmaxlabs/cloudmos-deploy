import React, { useState } from "react";
import { TransactionModal } from "./TransactionModal";

const TransactionModalContext = React.createContext({});

export const TransactionModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(null);

  const openModal = (options) => {
    setIsOpen(true);
    setOptions(options);
  };

  function handleConfirmTransaction() {
    setIsOpen(false);
    options.actionCallback(/** maybe some info about the tx */);
    setOptions(null);
  }

  function handleClose() {
    setIsOpen(false);
    options.actionCallback(null);
    setOptions(null);
  }

  return (
    <TransactionModalContext.Provider value={{ openModal }}>
      {options && <TransactionModal isOpen={isOpen} onClose={handleClose} onConfirmTransaction={handleConfirmTransaction} messages={options.messages} />}
      {children}
    </TransactionModalContext.Provider>
  );
};

export const useTransactionModal = () => {
  const { openModal } = React.useContext(TransactionModalContext);

  const sendTransaction = (messages) =>
    new Promise((res) => {
      openModal({ actionCallback: res, messages });
    });

  return { sendTransaction };
};
