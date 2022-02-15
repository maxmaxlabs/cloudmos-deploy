import { Route } from "react-router-dom";
import { CreateDeploymentWizard } from "../../routes/CreateDeploymentWizard";
import { DeploymentList } from "../../routes/DeploymentList";
import { DeploymentDetail } from "../../routes/DeploymentDetail";
import { TemplateGallery } from "../../routes/TemplateGallery";
import { useWallet } from "../../context/WalletProvider";
import { useDeploymentList } from "../../queries";
import { Dashboard } from "../../routes/Dashboard";
import { Settings } from "../../routes/Settings";
import { TemplateDetails } from "../../routes/TemplateDetails";

export function RightContent() {
  const { address } = useWallet();
  const { data: deployments, isFetching: isFetchingDeployments, refetch } = useDeploymentList(address, { enabled: false });

  return (
    <>
      <Route exact path="/createDeployment/:step?/:dseq?">
        <CreateDeploymentWizard />
      </Route>
      <Route path="/deployment/:dseq">
        <DeploymentDetail deployments={deployments} />
      </Route>
      <Route exact path="/deployments">
        <DeploymentList deployments={deployments} refreshDeployments={refetch} isLoadingDeployments={isFetchingDeployments} />
      </Route>
      <Route path="/templates/:templatePath">
        <TemplateDetails />
      </Route>
      <Route exact path="/templates">
        <TemplateGallery />
      </Route>
      <Route exact path="/settings">
        <Settings />
      </Route>
      <Route exact path="/">
        <Dashboard deployments={deployments} refreshDeployments={refetch} isLoadingDeployments={isFetchingDeployments} />
      </Route>
    </>
  );
}
