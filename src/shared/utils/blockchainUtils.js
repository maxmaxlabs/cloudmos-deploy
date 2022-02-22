import { Registry } from "@cosmjs/proto-signing";
import { MsgSend } from "@cosmjs/stargate/build/codec/cosmos/bank/v1beta1/tx";
import { protoTypes } from "../protoTypes";
import { TransactionMessageData } from "./TransactionMessageData";
import { selectedNetworkId } from "../deploymentData";

export let customRegistry;

export function registerTypes() {
  const registery = new Registry();
  registery.register(TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT, protoTypes.MsgCloseDeployment);
  registery.register(TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT, protoTypes.MsgCreateDeployment);
  registery.register(TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT, protoTypes.MsgUpdateDeployment);
  registery.register(TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT, protoTypes.MsgDepositDeployment);
  registery.register(TransactionMessageData.Types.MSG_CREATE_LEASE, protoTypes.MsgCreateLease);
  registery.register(TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE, protoTypes.MsgRevokeCertificate);
  registery.register(TransactionMessageData.Types.MSG_CREATE_CERTIFICATE, protoTypes.MsgCreateCertificate);
  registery.register(TransactionMessageData.Types.MSG_SEND_TOKENS, MsgSend);

  customRegistry = registery;
}

export const baseGas = "800000";
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
export const createFee = (type, gas = baseGas, msgCount = 1) => {
  const feesToUse = selectedNetworkId === "edgenet" ? edgenetFees : fees;
  return { gas, amount: [{ denom: "uakt", amount: (feesToUse[type] * msgCount).toString() }] };
};

export const createCustomFee = (fee = fees["avg"], gas = baseGas, msgCount = 1) => {
  return { gas, amount: [{ denom: "uakt", amount: (fee * msgCount).toString() }] };
};
