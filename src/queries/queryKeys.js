export class QueryKeys {
  static getDeploymentListKey = (address) => ["DEPLOYMENT_LIST", address];
  static getDeploymentDetailKey = (address, dseq) => ["DEPLOYMENT_DETAIL", address, dseq];
  static getAllLeasesKey = (address) => ["ALL_LEASES", address];
  static getLeasesKey = (address, dseq) => ["LEASE_LIST", address, dseq];
  static getLeaseStatusKey = (dseq, gseq, oseq) => ["LEASE_STATUS", dseq, gseq, oseq];
  static getBidListKey = (address, dseq) => ["BID_LIST", address, dseq];
  static getProvidersKey = () => ["PROVIDERS"];
  static getProviderDetailKey = (owner) => ["PROVIDERS", owner];
  static getDataNodeProvidersKey = () => ["DATA_NODE_PROVIDERS"];
  static getProviderStatusKey = (providerUri) => ["PROVIDER_STATUS", providerUri];
  static getNetworkCapacity = () => ["NETWORK_CAPACITY"];
  static getAuditorsKey = () => ["AUDITORS"];
  static getBlockKey = (id) => ["BLOCK", id];
  static getBalancesKey = (address) => ["BALANCES", address];
  static getTemplatesKey = () => ["TEMPLATES"];
}
