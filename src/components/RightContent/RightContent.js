import { Route } from "react-router-dom";
import { CreateDeploymentWizard } from "../../routes/CreateDeploymentWizard";
import { DeploymentList } from "../../routes/DeploymentList";
import { DeploymentDetail } from "../../routes/DeploymentDetail";
import { TemplateGallery } from "../../routes/TemplateGallery";
import { useWallet } from "../../context/WalletProvider";
import { Dashboard } from "../../routes/Dashboard";
import { Settings } from "../../routes/Settings";
import { TemplateDetails } from "../../routes/TemplateDetails";
import { Providers } from "../../routes/Providers";
import { ProviderDetail } from "../../routes/ProviderDetail";
import { useProviders, useAllLeases, useDeploymentList, useDataNodeProviders } from "../../queries";

export function RightContent() {
  const { address } = useWallet();
  const { data: deployments, isFetching: isFetchingDeployments, refetch: getDeployments } = useDeploymentList(address, { enabled: false });
  const { data: providers, isFetching: isFetchingProviders, refetch: getProviders } = useProviders({ enabled: false });
  const { data: leases, isFetching: isFetchingLeases, refetch: getLeases } = useAllLeases(address, { enabled: false });
  const { data: dataNodeProviders, isFetching: isFetchingDataNodeProviders, refetch: getDataNodeProviders } = useDataNodeProviders({ enabled: false });

  return (
    <>
      <Route exact path="/createDeployment/:step?/:dseq?">
        <CreateDeploymentWizard />
      </Route>
      <Route path="/deployment/:dseq">
        <DeploymentDetail deployments={deployments} />
      </Route>
      <Route exact path="/deployments">
        <DeploymentList deployments={deployments} refreshDeployments={getDeployments} isLoadingDeployments={isFetchingDeployments} />
      </Route>
      <Route path="/templates/:templatePath">
        <TemplateDetails />
      </Route>
      <Route exact path="/templates">
        <TemplateGallery />
      </Route>
      <Route exact path="/providers">
        <Providers
          providers={providers}
          getProviders={getProviders}
          isLoadingProviders={isFetchingProviders}
          leases={leases}
          isLoadingLeases={isFetchingLeases}
          getLeases={getLeases}
          dataNodeProviders={dataNodeProviders}
          isLoadingDataNodeProviders={isFetchingDataNodeProviders}
          getDataNodeProviders={getDataNodeProviders}
        />
      </Route>
      <Route exact path="/providers/:owner">
        <ProviderDetail
          providers={providers}
          leases={leases}
          getLeases={getLeases}
          isLoadingLeases={isFetchingLeases}
          dataNodeProviders={dataNodeProviders}
          isLoadingDataNodeProviders={isFetchingDataNodeProviders}
          getDataNodeProviders={getDataNodeProviders}
        />
      </Route>
      <Route exact path="/settings">
        <Settings />
      </Route>
      <Route exact path="/">
        <Dashboard deployments={deployments} refreshDeployments={getDeployments} isLoadingDeployments={isFetchingDeployments} />
      </Route>
    </>
  );
}
