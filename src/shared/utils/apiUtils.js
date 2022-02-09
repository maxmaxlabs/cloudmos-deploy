export class ApiUrlService {
  static deploymentList(apiEndpoint, address) {
    return `${apiEndpoint}/akash/deployment/v1beta1/deployments/list?filters.owner=${address}&pagination.limit=2000`;
  }
  static deploymentDetail(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/deployment/v1beta1/deployments/info?id.owner=${address}&id.dseq=${dseq}`;
  }
  static bidList(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/market/v1beta1/bids/list?filters.owner=${address}&filters.dseq=${dseq}`;
  }
  static leaseList(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/market/v1beta1/leases/list?filters.owner=${address}&filters.dseq=${dseq}`;
  }
  static providers(apiEndpoint) {
    return `${apiEndpoint}/akash/provider/v1beta1/providers`;
  }
  static block(apiEndpoint, id) {
    return `${apiEndpoint}/blocks/${id}`;
  }
}
