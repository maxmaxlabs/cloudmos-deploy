export class UrlService {
  static register = (add) => `/register${appendSearchParams({ add })}`;
  static newWallet = (add) => `/new-wallet${appendSearchParams({ add })}`;
  static walletImport = (add) => `/wallet-import${appendSearchParams({ add })}`;
  static walletOpen = () => "/wallet-open";

  static dashboard = () => "/";
  static deploymentList = () => `/deployments`;
  static deploymentDetails = (dseq, tab, logsMode) => `/deployment/${dseq}${appendSearchParams({ tab, logsMode })}`;
  static templates = (category, search) => `/templates${appendSearchParams({ category, search })}`;
  static templateDetails = (templateId) => `/templates/${templateId}`;
  static providers = () => "/providers";
  static providerDetail = (owner) => `/providers/${owner}`;
  static settings = () => "/settings";

  static createDeployment = (dseq) => `/createDeployment${dseq ? "?redeploy=" + dseq : ""}`;
  static createDeploymentFromTemplate = (templateId) => `/createDeployment?templateId=${templateId}`;
  static createDeploymentStepTemplate = () => "/createDeployment/chooseTemplate";
  static createDeploymentStepManifest = () => "/createDeployment/editManifest";
  static createDeploymentStepBids = () => "/createDeployment/acceptBids";
}

// Must update this when adding a route for analytics logging
export const legitPaths = [
  "wallet-import",
  "wallet-open",
  "deployments",
  "deployment",
  "settings",
  "createDeployment",
  "templates",
  "register",
  "new-wallet",
  "providers"
];

function appendSearchParams(params) {
  const urlParams = new URLSearchParams("");
  Object.keys(params).forEach((p) => {
    if (params[p]) {
      urlParams.set(p, params[p]);
    }
  });

  const res = urlParams.toString();

  return !!res ? `?${res}` : res;
}
