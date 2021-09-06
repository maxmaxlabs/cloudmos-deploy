import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { ApiUrlService } from "../shared/utils/apiUtils";
import { deploymentToDto } from "../shared/utils/deploymentDetailUtils";
import { useSettings } from "../context/SettingsProvider";
import { deploymentGroupResourceSum } from "../shared/utils/deploymentDetailUtils";

async function getDeploymentList(apiEndpoint, address) {
  if (!address) return [];

  const response = await axios.get(ApiUrlService.deploymentList(apiEndpoint, address));
  let deployments = response.data;

  return deployments.deployments.map((d) => deploymentToDto(d));
}

export function useDeploymentList(address, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getDeploymentListKey(address), () => getDeploymentList(settings.apiEndpoint, address), options);
}

async function getLeases(apiEndpoint, deployment, address) {
  const response = await axios.get(ApiUrlService.leaseList(apiEndpoint, address, deployment.dseq));

  const leases = response.data.leases.map((l) => {
    const group = deployment.groups.filter((g) => g.group_id.gseq === l.lease.lease_id.gseq)[0] || {};

    return {
      id: l.lease.lease_id.dseq + l.lease.lease_id.gseq + l.lease.lease_id.oseq,
      owner: l.lease.lease_id.owner,
      provider: l.lease.lease_id.provider,
      dseq: l.lease.lease_id.dseq,
      gseq: l.lease.lease_id.gseq,
      oseq: l.lease.lease_id.oseq,
      state: l.lease.state,
      price: l.lease.price,
      cpuAmount: deploymentGroupResourceSum(group, (r) => parseInt(r.cpu.units.val) / 1000),
      memoryAmount: deploymentGroupResourceSum(group, (r) => parseInt(r.memory.quantity.val)),
      storageAmount: deploymentGroupResourceSum(group, (r) => parseInt(r.storage.quantity.val)),
      group
    };
  });

  return leases;
}

export function useLeaseList(deployment, address, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getLeasesKey(address, deployment?.dseq), () => getLeases(settings.apiEndpoint, deployment, address), options);
}
