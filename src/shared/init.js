import { setNetworkVersion } from "./constants";
import { setMessageTypes } from "./utils/TransactionMessageData";
import { registerTypes } from "./utils/blockchainUtils";
import { initProtoTypes } from "./protoTypes";
import { initDeploymentData } from "./deploymentData";

export const initAppTypes = () => {
  setNetworkVersion();
  initProtoTypes();
  setMessageTypes();
  registerTypes();
  initDeploymentData();
};
