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
import { useAllLeases, useDeploymentList } from "../../queries";
import { useEffect } from "react";

export function RightContent() {
  const { address } = useWallet();
  const { data: deployments, isFetching: isFetchingDeployments, refetch: getDeployments } = useDeploymentList(address, { enabled: false });
  const { data: leases, isFetching: isFetchingLeases, refetch: getLeases } = useAllLeases(address, { enabled: false });

  useEffect(() => {
    getDeployments();
  }, [getDeployments, address]);

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
      <Route path="/templates/:templateId">
        <TemplateDetails />
      </Route>
      <Route exact path="/templates">
        <TemplateGallery />
      </Route>
      <Route exact path="/providers">
        <Providers leases={leases} isLoadingLeases={isFetchingLeases} getLeases={getLeases} />
      </Route>
      <Route exact path="/providers/:owner">
        <ProviderDetail leases={leases} getLeases={getLeases} isLoadingLeases={isFetchingLeases} />
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
