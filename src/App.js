import { useEffect } from "react";
import { PasswordConfirmationModalProvider } from "./context/ConfirmPasswordModal";
import { CertificateProvider } from "./context/CertificateProvider";
import { TransactionModalProvider } from "./context/TransactionModal";
import { WalletProvider } from "./context/WalletProvider";
import { QueryClientProvider } from "react-query";
import { SettingsProvider } from "./context/SettingsProvider";
import { LocalNoteProvider } from "./context/LocalNoteProvider";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { HelmetProvider } from "react-helmet-async";
import { Helmet } from "react-helmet-async";
import { analytics, HOSTNAME } from "./shared/utils/analyticsUtils";
import { queryClient } from "./queries";
import { AppSettingsContainer } from "./AppSettingsContainer";
import { legitPaths } from "./shared/utils/urlUtils";
import { PriceProvider } from "./context/PriceProvider";
import { IntlProvider } from "react-intl";
import { TemplatesProvider } from "./context/TemplatesProvider/TemplatesProviderContext";
import { AsyncTaskProvider } from "./context/AsyncTaskProvider";
import { CustomSnackbarProvider } from "./context/CustomSnackbarProvider";
import { AkashProvider } from "./context/AkashProvider";

let history = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 1
});

function App() {
  // Init analytics
  useEffect(() => {
    const init = async () => {
      const shouldLog = isLegitPath(window.location.pathname);
      shouldLog && (await analytics.pageview(HOSTNAME, window.location.pathname + window.location.search, document.title));
    };

    history.listen(async (location, action) => {
      try {
        setTimeout(async () => {
          const shouldLog = isLegitPath(location.pathname);
          shouldLog && (await analytics.pageview(HOSTNAME, location.pathname + location.search, document.title));
        }, 100);
      } catch (error) {
        console.log(error);
      }
    });

    init();
  }, []);

  const isLegitPath = (pathname) => {
    const firstPath = pathname.split("/")[1];
    return legitPaths.includes(firstPath) || firstPath === "";
  };

  return (
    <IntlProvider locale="en">
      <Router history={history}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <CustomSnackbarProvider>
              <AsyncTaskProvider>
                <PriceProvider>
                  <SettingsProvider>
                    <WalletProvider>
                      <TransactionModalProvider>
                        <PasswordConfirmationModalProvider>
                          <CertificateProvider>
                            <LocalNoteProvider>
                              <AkashProvider>
                                <TemplatesProvider>
                                  <Helmet defaultTitle="Cloudmos Deploy" titleTemplate="Cloudmos Deploy - %s" />

                                  <AppSettingsContainer />
                                </TemplatesProvider>
                              </AkashProvider>
                            </LocalNoteProvider>
                          </CertificateProvider>
                        </PasswordConfirmationModalProvider>
                      </TransactionModalProvider>
                    </WalletProvider>
                  </SettingsProvider>
                </PriceProvider>
              </AsyncTaskProvider>
            </CustomSnackbarProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </Router>
    </IntlProvider>
  );
}

export default App;
