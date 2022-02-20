import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { ApiUrlService } from "../shared/utils/apiUtils";
import { useSettings } from "../context/SettingsProvider";
import { deploymentGroupResourceSum } from "../shared/utils/deploymentDetailUtils";
import { useCertificate } from "../context/CertificateProvider";

// Leases
async function getLeases(apiEndpoint, deployment, address) {
  if (!address || !deployment) {
    return null;
  }

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
      storageAmount: deploymentGroupResourceSum(group, (r) => parseInt(r.storage.map(x => x.quantity.val).reduce((a,b) => a+b, 0))),
      group
    };
  });

  return leases;
}

export function useLeaseList(deployment, address, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getLeasesKey(address, deployment?.dseq), () => getLeases(settings.apiEndpoint, deployment, address), options);
}

async function getLeaseStatus(providerUri, lease, localCert) {
  const leaseStatusPath = `${providerUri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/status`;
  const response = await window.electron.queryProvider(leaseStatusPath, "GET", null, localCert.certPem, localCert.keyPem);
  return response;
}

export function useLeaseStatus(providerUri, lease, options) {
  const { localCert } = useCertificate();
  return useQuery(QueryKeys.getLeaseStatusKey(lease.dseq, lease.gseq, lease.oseq), () => getLeaseStatus(providerUri, lease, localCert), options);
}
