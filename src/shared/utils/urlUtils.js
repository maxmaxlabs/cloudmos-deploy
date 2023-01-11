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

  // Cloudmos explorer
  /**
   * Example
   * UrlService.alertsCreate(null, "akt", "send-tokens", {
        from: { operator: "eq", value: address },
        amount: { operator: "gt", value: 10000 }
      })
   */
  static alertsCreate = (id, chain, type, conditions) => {
    const _conditions = {};

    for (const key in conditions) {
      if (conditions[key].operator) {
        _conditions[`c.${key}.o`] = conditions[key].operator;
      }
      if (conditions[key].value) {
        _conditions[`c.${key}.v`] = conditions[key].value;
      }
      if (conditions[key].unit) {
        _conditions[`c.${key}.u`] = conditions[key].unit;
      }
    }

    return `https://cloudmos.io/alerts/create${appendSearchParams({ id, chain, type, ..._conditions })}`;
  };
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
