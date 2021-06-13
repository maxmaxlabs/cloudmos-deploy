export class ApiUrlService {
  static deploymentList(apiEndpoint, address) {
    return apiEndpoint + "/akash/deployment/v1beta1/deployments/list?filters.owner=" + address;
  }
}
