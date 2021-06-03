import "./App.css";
import { PasswordConfirmationModalProvider } from "./ConfirmPasswordModal/ConfirmPasswordModalContext";
import { MainView } from "./MainView";
import { CertificateProvider } from "./CertificateProvider/CertificateProviderContext";
import { WalletProvider } from "./WalletProvider/WalletProviderContext";

function App() {
  return (
    <PasswordConfirmationModalProvider>
      <WalletProvider>
        <CertificateProvider>
          <MainView />
        </CertificateProvider>
      </WalletProvider>
    </PasswordConfirmationModalProvider>
  );
}

export default App;
