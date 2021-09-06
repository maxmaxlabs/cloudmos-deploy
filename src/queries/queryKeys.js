export class QueryKeys {
  static getDeploymentListKey = (address) => ["DEPLOYMENT_LIST", address];
  static getBidListKey = (address, dseq) => ["BID_LIST", address, dseq];
  static getProvidersKey = () => ["PROVIDERS"];
}
