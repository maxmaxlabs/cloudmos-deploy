import * as v1beta2 from "./v1beta2";
import { mainnetId, testnetId, edgenetId } from "../constants";
export * from "./helpers";

export let deploymentData;
export let selectedNetworkId;

export function initDeploymentData() {
  selectedNetworkId = localStorage.getItem("selectedNetworkId");

  switch (selectedNetworkId) {
    case mainnetId:
      deploymentData = v1beta2;
      break;
    case testnetId:
      deploymentData = v1beta2;
      break;
    case edgenetId:
      deploymentData = v1beta2;
      break;

    default:
      deploymentData = v1beta2;
      break;
  }
}
