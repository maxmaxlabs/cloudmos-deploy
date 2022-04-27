import * as v1beta2 from "./v1beta2";
import { mainnetId, testnetId, edgenetId } from "../constants";

export let protoTypes;

export function initProtoTypes() {
  const selectedNetworkId = localStorage.getItem("selectedNetworkId");

  switch (selectedNetworkId) {
    case mainnetId:
      protoTypes = v1beta2;
      break;
    case testnetId:
      protoTypes = v1beta2;
      break;
    case edgenetId:
      protoTypes = v1beta2;
      break;

    default:
      protoTypes = v1beta2;
      break;
  }
}
