import { Registry } from "@cosmjs/proto-signing";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { protoTypes } from "../protoTypes";
import { TransactionMessageData } from "./TransactionMessageData";
import { GasPrice } from "@cosmjs/stargate";

export let customRegistry;

export function registerTypes() {
  const registry = new Registry();
  registry.register(TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT, protoTypes.MsgCloseDeployment);
  registry.register(TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT, protoTypes.MsgCreateDeployment);
  registry.register(TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT, protoTypes.MsgUpdateDeployment);
  registry.register(TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT, protoTypes.MsgDepositDeployment);
  registry.register(TransactionMessageData.Types.MSG_CREATE_LEASE, protoTypes.MsgCreateLease);
  registry.register(TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE, protoTypes.MsgRevokeCertificate);
  registry.register(TransactionMessageData.Types.MSG_CREATE_CERTIFICATE, protoTypes.MsgCreateCertificate);
  registry.register(TransactionMessageData.Types.MSG_GRANT, protoTypes.MsgGrant);
  registry.register(TransactionMessageData.Types.MSG_SEND_TOKENS, MsgSend);

  customRegistry = registry;
}

export const txFeeBuffer = 10000; // 10000 uAKT

// { low: 0.01, average: 0.025, high: 0.03 }
export const gasPrices = {
  low: GasPrice.fromString("0.01uakt"),
  average: GasPrice.fromString("0.025uakt"),
  high: GasPrice.fromString("0.03uakt")
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
 * @returns The fee object
 */
export const createCustomFee = (fee, gas) => {
  return { gas: gas.toString(), amount: [{ denom: "uakt", amount: fee.toString() }] };
};
