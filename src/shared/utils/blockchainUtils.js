import { Registry } from "@cosmjs/proto-signing";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { protoTypes } from "../protoTypes";
import { TransactionMessageData } from "./TransactionMessageData";
import { selectedNetworkId } from "../deploymentData";
import { GasPrice } from "@cosmjs/stargate";

export let customRegistry;

export function registerTypes() {
  const registry = new Registry();
  registry.register(TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT.type, protoTypes.MsgCloseDeployment);
  registry.register(TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT.type, protoTypes.MsgCreateDeployment);
  registry.register(TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT.type, protoTypes.MsgUpdateDeployment);
  registry.register(TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT.type, protoTypes.MsgDepositDeployment);
  registry.register(TransactionMessageData.Types.MSG_CREATE_LEASE.type, protoTypes.MsgCreateLease);
  registry.register(TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE.type, protoTypes.MsgRevokeCertificate);
  registry.register(TransactionMessageData.Types.MSG_CREATE_CERTIFICATE.type, protoTypes.MsgCreateCertificate);
  registry.register(TransactionMessageData.Types.MSG_GRANT.type, protoTypes.MsgGrant);
  registry.register(TransactionMessageData.Types.MSG_SEND_TOKENS.type, MsgSend);

  customRegistry = registry;
}

// { low: 0.01, average: 0.025, high: 0.03 }
export const gasPrices = { low: GasPrice.fromString("0.01uakt"), average: GasPrice.fromString("0.025uakt"), high: GasPrice.fromString("0.03uakt") };

// TODO fees per node settings
export const fees = {
  low: 4000,
  avg: 5000,
  high: 6000
};
export const edgenetFees = {
  low: 20000,
  avg: 24000,
  high: 28000
};

/**
 * Get the fee object for an Akash transaction
 * @param {string} type low | avg | high
 * @param {number} gas transaction gas
 * @param {number} msgCount number of messages
 * @returns The fee object
 */
export const createFee = (type, gas, msgCount = 1) => {
  const feesToUse = selectedNetworkId === "edgenet" ? edgenetFees : fees;
  return { gas: gas.toString(), amount: [{ denom: "uakt", amount: (feesToUse[type] * msgCount).toString() }] };
};

export const createCustomFee = (fee = fees["avg"], gas, msgCount = 1) => {
  return { gas: gas.toString(), amount: [{ denom: "uakt", amount: (fee * msgCount).toString() }] };
};
