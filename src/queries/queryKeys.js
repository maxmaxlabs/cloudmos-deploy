export class QueryKeys {
  static getDeploymentListKey = (address) => ["DEPLOYMENT_LIST", address];
  static getLeasesKey = (address, dseq) => ["LEASE_LIST", address, dseq];
  static getBidListKey = (address, dseq) => ["BID_LIST", address, dseq];
  static getProvidersKey = () => ["PROVIDERS"];

}
