import { useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import { CreateDeploymentWizard } from "../../routes/CreateDeploymentWizard";
import { DeploymentList } from "../../routes/DeploymentList";
import { DeploymentDetail } from "../../routes/DeploymentDetail";
import { useWallet } from "../../context/WalletProvider";
import { useDeploymentList } from "../../queries";
import { Dashboard } from "../../routes/Dashboard";
import { Settings } from "../../routes/Settings";
import { useQueryParams } from "../../hooks/useQueryParams";

export function RightContent() {
  const history = useHistory();
  const params = useQueryParams();
  const { address } = useWallet();
  const { data: deployments, isLoading: isLoadingDeployments, isFetching: isFetchingDeployments, refetch } = useDeploymentList(address);

  useEffect(() => {
    // using query params to tell react-query to refetch manually
    if (params.get("refetch") === "true") {
      refetch();

      history.replace(history.location.pathname);
    }
  }, [params, history, refetch]);

  return (
    <>
      <Route exact path="/createDeployment/:step?/:dseq?">
        <CreateDeploymentWizard />
      </Route>
      <Route path="/deployment/:dseq">
        <DeploymentDetail deployments={deployments} />
      </Route>
      <Route exact path="/deployments">
        <DeploymentList deployments={deployments} isLoadingDeployments={isFetchingDeployments} />
      </Route>
      <Route exact path="/settings">
        <Settings />
      </Route>
      <Route exact path="/">
        <Dashboard deployments={deployments} isLoadingDeployments={isFetchingDeployments} />
      </Route>
    </>
  );
}
