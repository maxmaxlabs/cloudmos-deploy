export function deploymentResourceSum(deployment, resourceSelector) {
  return deployment.groups
    .map((g) => g.group_spec.resources.map((r) => r.count * resourceSelector(r.resources)).reduce((a, b) => a + b))
    .reduce((a, b) => a + b);
}

export function deploymentGroupResourceSum(group, resourceSelector) {
  if (!group || !group.group_spec || !group.group_spec) return 0;

  return group.group_spec.resources.map((r) => r.count * resourceSelector(r.resources)).reduce((a, b) => a + b);
}

export function deploymentToDto(d) {
  return {
    dseq: d.deployment.deployment_id.dseq,
    state: d.deployment.state,
    createdAt: parseInt(d.deployment.created_at),
    escrowBalance: d.escrow_account.balance,
    transferred: d.escrow_account.transferred,
    cpuAmount: deploymentResourceSum(d, (r) => parseInt(r.cpu.units.val) / 1000),
    memoryAmount: deploymentResourceSum(d, (r) => parseInt(r.memory.quantity.val)),
    storageAmount: deploymentResourceSum(d, (r) =>
      convertToArrayIfNeeded(r.storage)
        .map((x) => parseInt(x.quantity.val))
        .reduce((a, b) => a + b, 0)
    ),
    escrowAccount: { ...d.escrow_account },
    groups: [...d.groups]
  };
}

export function convertToArrayIfNeeded(arrayOrItem) {
  return arrayOrItem.map ? arrayOrItem : [arrayOrItem];
}

export const getStorageAmount = (resource) => {
  let storage;

  if (Array.isArray(resource.storage)) {
    storage = resource.storage.map((x) => parseInt(x.quantity.val)).reduce((a, b) => a + b, 0);
  } else {
    storage = parseInt(resource.storage.quantity.val);
  }

  return storage;
};
