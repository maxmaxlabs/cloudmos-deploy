export class UrlService {
  static dashboard = () => "/";
  static deploymentList = () => "/deployments";

  static createDeployment = () => "/createDeployment";
  static createDeploymentStepTemplate = () => "/createDeployment/chooseTemplate";
  static createDeploymentStepManifest = () => "/createDeployment/editManifest";
  static createDeploymentStepBids = () => "/createDeployment/acceptBids";
}
