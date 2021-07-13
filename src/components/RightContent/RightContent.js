import { useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import { CreateDeploymentWizard } from "../../routes/CreateDeploymentWizard";
import { DeploymentList } from "../../routes/DeploymentList";
import { DeploymentDetail } from "../../routes/DeploymentDetail";
import { useWallet } from "../../context/WalletProvider";
import { useDeploymentList } from "../../queries";
import { Dashboard } from "../../routes/Dashboard";
import { Settings } from "../../routes/Settings";

export function RightContent() {
  const history = useHistory();
  const { address } = useWallet();
  const { data: deployments, isLoading: isLoadingDeployments, isFetching: isFetchingDeployments, refetch } = useDeploymentList(address);

  useEffect(() => {
    if (history.location.pathname === "/deployments" || history.location.pathname === "/") {
      refetch();
    }
  }, [history.location.pathname, refetch]);

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
      <Route exact path="/settings">
        <Settings />
      </Route>
      <Route exact path="/">
        <Dashboard deployments={deployments} refreshDeployments={refetch} isLoadingDeployments={isFetchingDeployments} />
      </Route>
    </>
  );
}
