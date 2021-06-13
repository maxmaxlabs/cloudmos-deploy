import { apiEndpoint } from "../constants";

export class UrlService {
  static deploymentList(address) {
    return apiEndpoint + "/akash/deployment/v1beta1/deployments/list?filters.owner=" + address;
  }
}
