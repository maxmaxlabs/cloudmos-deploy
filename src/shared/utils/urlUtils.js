export class UrlService {
  static dashboard = () => "/";
  static deploymentList = () => "/deployments";
  static settings = () => "/settings";

  static createDeployment = () => "/createDeployment";
  static createDeploymentStepTemplate = () => "/createDeployment/chooseTemplate";
  static createDeploymentStepManifest = () => "/createDeployment/editManifest";
  static createDeploymentStepBids = () => "/createDeployment/acceptBids";
}
