export class ApiUrlService {
  static deploymentList(apiEndpoint, address) {
    return apiEndpoint + "/akash/deployment/v1beta1/deployments/list?filters.owner=" + address + "&pagination.limit=1000";
  }
  static bidList(apiEndpoint, address, dseq) {
    return apiEndpoint + "/akash/market/v1beta1/bids/list?filters.owner=" + address + "&filters.dseq=" + dseq;
  }
}
