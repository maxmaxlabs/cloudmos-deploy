export class QueryKeys {
  static getDeploymentListKey = (address) => ["DEPLOYMENT_LIST", address];
  static getDeploymentDetailKey = (address, dseq) => ["DEPLOYMENT_DETAIL", address, dseq];
  static getLeasesKey = (address, dseq) => ["LEASE_LIST", address, dseq];
  static getLeaseStatusKey = (dseq, gseq, oseq) => ["LEASE_STATUS", dseq, gseq, oseq];
  static getBidListKey = (address, dseq) => ["BID_LIST", address, dseq];
  static getProvidersKey = () => ["PROVIDERS"];
  static getBlockKey = (id) => ["BLOCK", id];
}
