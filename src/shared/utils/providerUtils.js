export function providerStatusToDto(providerStatus) {
  return {
    name: providerStatus.cluster_public_hostname,
    orderCount: providerStatus.bidengine.orders,
    deploymentCount: providerStatus.manifest.deployments,
    leaseCount: providerStatus.cluster.leases,
    active: providerStatus.cluster.inventory.active,
    available: providerStatus.cluster.inventory.available,
    pending: providerStatus.cluster.inventory.pending,
    error: providerStatus.cluster.inventory.error
  };
}

export function getTotalProviderResource(resources) {
  const result = resources
    ?.map((x) => {
      return {
        cpu: getCpuValue(x?.cpu),
        memory: getByteValue(x?.memory),
        storage: getByteValue(x?.storage)
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
  return typeof cpu === "number" ? cpu : Number(cpu.units.val) / 1000;
}

function getByteValue(val) {
  return typeof val === "number" ? val : Number(val.size.val);
}