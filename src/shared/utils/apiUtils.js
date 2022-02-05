import { networkVersion } from "../constants";

export class ApiUrlService {
  static deploymentList(apiEndpoint, address) {
    return `${apiEndpoint}/akash/deployment/${networkVersion}/deployments/list?filters.owner=${address}&pagination.limit=2000`;
  }
  static deploymentDetail(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/deployment/${networkVersion}/deployments/info?id.owner=${address}&id.dseq=${dseq}`;
  }
  static bidList(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/market/${networkVersion}/bids/list?filters.owner=${address}&filters.dseq=${dseq}`;
  }
  static leaseList(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/market/${networkVersion}/leases/list?filters.owner=${address}&filters.dseq=${dseq}`;
  }
  static providers(apiEndpoint) {
    return `${apiEndpoint}/akash/provider/${networkVersion}/providers`;
  }
  static block(apiEndpoint, id) {
    return `${apiEndpoint}/blocks/${id}`;
  }
}
