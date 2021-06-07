export function getDeploymentLocalData(dseq) {
  const dataStr = localStorage.getItem(`deployments/${dseq}.data`);
  if (!dataStr) return null;

  const parsedData = JSON.parse(dataStr);

  return parsedData;
}

export function saveDeploymentManifest(dseq, manifest, version) {
  const data = getDeploymentLocalData(dseq) || {};
  data.manifest = manifest;
  data.manifestVersion = version;

  localStorage.setItem(`deployments/${dseq}.data`, JSON.stringify(data));
}
