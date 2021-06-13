import { apiEndpoint } from "../constants";

export class ApiUrlService {
  static deploymentList(address) {
    return apiEndpoint + "/akash/deployment/v1beta1/deployments/list?filters.owner=" + address;
  }
}
