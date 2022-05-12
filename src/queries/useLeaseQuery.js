import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import { ApiUrlService, loadWithPagination } from "../shared/utils/apiUtils";
import { useSettings } from "../context/SettingsProvider";
import { leaseToDto } from "../shared/utils/deploymentDetailUtils";
import { useCertificate } from "../context/CertificateProvider";

// Leases
async function getDeploymentLeases(apiEndpoint, address, deployment) {
  if (!address) {
    return null;
  }

  const response = await loadWithPagination(ApiUrlService.leaseList(apiEndpoint, address, deployment?.dseq), "leases", 1000);

  const leases = response.map((l) => leaseToDto(l, deployment));

  return leases;
}

export function useDeploymentLeaseList(address, deployment, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getLeasesKey(address, deployment?.dseq), () => getDeploymentLeases(settings.apiEndpoint, address, deployment), options);
}

async function getAllLeases(apiEndpoint, address, deployment) {
  if (!address) {
    return null;
  }

  const response = await loadWithPagination(ApiUrlService.leaseList(apiEndpoint, address, deployment?.dseq), "leases", 1000);

  const leases = response.map((l) => leaseToDto(l, deployment));

  return leases;
}

export function useAllLeases(address, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getAllLeasesKey(address), () => getAllLeases(settings.apiEndpoint, address), options);
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
