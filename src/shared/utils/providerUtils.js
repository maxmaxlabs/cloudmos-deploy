import { roundDecimal } from "./math";

export function providerStatusToDto(providerStatus, providerVersion) {
  return {
    name: providerStatus.cluster_public_hostname,
    orderCount: providerStatus.bidengine.orders,
    deploymentCount: providerStatus.manifest.deployments,
    leaseCount: providerStatus.cluster.leases,
    active: providerStatus.cluster.inventory.active,
    available: providerStatus.cluster.inventory.available,
    pending: providerStatus.cluster.inventory.pending,
    error: providerStatus.cluster.inventory.error,
    akash: providerVersion.akash,
    kube: providerVersion.kube
  };
}

function getStorageFromResource(resource) {
  return Object.keys(resource).includes("storage_ephemeral") ? resource.storage_ephemeral : resource.storage;
}

export function getTotalProviderResource(resources) {
  const resourcesArr = resources?.nodes || resources;

  const result = resourcesArr
    ?.map((x) => {
      return {
        cpu: getCpuValue(x.cpu),
        memory: getByteValue(x.memory),
        storage: getByteValue(getStorageFromResource(x))
      };
    })
    .reduce((prev, current) => {
      return {
        cpu: prev?.cpu + current.cpu,
        memory: prev?.memory + current.memory,
        storage: prev?.storage + current.storage
      };
    });

  return result || { cpu: 0, memory: 0, storage: 0 };
}

function getCpuValue(cpu) {
  const _cpu = typeof cpu === "number" ? cpu : parseInt(cpu.units.val);
  return roundDecimal(_cpu / 1000, 1);
}

function getByteValue(val) {
  return typeof val === "number" ? val : parseInt(val.size.val);
}

export function getNetworkCapacityDto(networkCapacity) {
  return {
    ...networkCapacity,
    activeCPU: networkCapacity.activeCPU / 1000,
    pendingCPU: networkCapacity.pendingCPU / 1000,
    availableCPU: networkCapacity.availableCPU / 1000,
    totalCPU: networkCapacity.totalCPU / 1000
  };
}

export function getProviderLocalData() {
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  const dataStr = localStorage.getItem(`${selectedNetworkId}/provider.data`);
  if (!dataStr) {
    return { favorites: [] };
  }

  const parsedData = JSON.parse(dataStr);

  return parsedData;
}

export function updateProviderLocalData(data) {
  const oldData = getProviderLocalData();
  const newData = { ...oldData, ...data };

  const selectedNetworkId = localStorage.getItem("selectedNetworkId");
  localStorage.setItem(`${selectedNetworkId}/provider.data`, JSON.stringify(newData));
}
