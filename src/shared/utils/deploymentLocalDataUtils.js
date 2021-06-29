export function getDeploymentLocalData(dseq) {
  const dataStr = localStorage.getItem(`deployments/${dseq}.data`);
  if (!dataStr) return null;

  const parsedData = JSON.parse(dataStr);

  return parsedData;
}

export function saveDeploymentManifest(dseq, manifest, version, address) {
  const data = getDeploymentLocalData(dseq) || {};
  data.owner = address;
  data.manifest = manifest;
  data.manifestVersion = version;

  localStorage.setItem(`deployments/${dseq}.data`, JSON.stringify(data));
}
