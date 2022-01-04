export class UrlService {
  static walletImport = () => "wallet-import";
  static walletOpen = () => "wallet-open";

  static dashboard = () => "/";
  static deploymentList = () => `/deployments`;
  static deploymentDetails = (dseq) => `/deployment/${dseq}`;
  static settings = () => "/settings";

  static createDeployment = (dseq) => `/createDeployment${dseq ? "?redeploy=" + dseq : ""}`;
  static createDeploymentStepTemplate = () => "/createDeployment/chooseTemplate";
  static createDeploymentStepManifest = () => "/createDeployment/editManifest";
  static createDeploymentStepBids = () => "/createDeployment/acceptBids";
}

export const legitPaths = ["wallet-import", "wallet-open", "deployments", "deployment", "settings", "createDeployment"];
