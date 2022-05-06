import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import { ApiUrlService, loadWithPagination } from "../shared/utils/apiUtils";
import { useSettings } from "../context/SettingsProvider";
import { deploymentGroupResourceSum, convertToArrayIfNeeded } from "../shared/utils/deploymentDetailUtils";
import { useCertificate } from "../context/CertificateProvider";

// Leases
async function getLeases(apiEndpoint, address, deployment) {
  if (!address) {
    return null;
  }

  const response = await loadWithPagination(ApiUrlService.leaseList(apiEndpoint, address, deployment?.dseq), "leases", 1000);

  const leases = response.map((l) => {
    const group = deployment ? deployment.groups.filter((g) => g.group_id.gseq === l.lease.lease_id.gseq)[0] : {};

    return {
      id: l.lease.lease_id.dseq + l.lease.lease_id.gseq + l.lease.lease_id.oseq,
      owner: l.lease.lease_id.owner,
      provider: l.lease.lease_id.provider,
      dseq: l.lease.lease_id.dseq,
      gseq: l.lease.lease_id.gseq,
      oseq: l.lease.lease_id.oseq,
      state: l.lease.state,
      price: l.lease.price,
      cpuAmount: deployment ? deploymentGroupResourceSum(group, (r) => parseInt(r.cpu.units.val) / 1000) : undefined,
      memoryAmount: deployment ? deploymentGroupResourceSum(group, (r) => parseInt(r.memory.quantity.val)) : undefined,
      storageAmount: deployment ? deploymentGroupResourceSum(group, (r) =>
        convertToArrayIfNeeded(r.storage)
          .map((x) => parseInt(x.quantity.val))
          .reduce((a, b) => a + b, 0)
      ) : undefined,
      group
    };
  });

  return leases;
}

export function useLeaseList(address, deployment, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getLeasesKey(address, deployment?.dseq), () => getLeases(settings.apiEndpoint, address, deployment), options);
}

async function getLeaseStatus(providerUri, lease, localCert) {
  if (!providerUri) return null;
  const leaseStatusPath = `${providerUri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/status`;
  const response = await window.electron.queryProvider(leaseStatusPath, "GET", null, localCert?.certPem, localCert?.keyPem);
  return response;
}

export function useLeaseStatus(providerUri, lease, options) {
  const { localCert } = useCertificate();
  return useQuery(QueryKeys.getLeaseStatusKey(lease.dseq, lease.gseq, lease.oseq), () => getLeaseStatus(providerUri, lease, localCert), options);
}
