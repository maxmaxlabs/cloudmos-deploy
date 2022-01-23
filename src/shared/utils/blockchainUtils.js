import { Registry } from "@cosmjs/proto-signing";
import { MsgSend } from "@cosmjs/stargate/build/codec/cosmos/bank/v1beta1/tx";
import {
  MsgCloseDeployment,
  MsgRevokeCertificate,
  MsgCreateCertificate,
  MsgCreateDeployment,
  MsgCreateLease,
  MsgUpdateDeployment,
  MsgDepositDeployment
} from "../ProtoAkashTypes";
import { TransactionMessageData } from "./TransactionMessageData";

const registery = new Registry();
registery.register(TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT, MsgCloseDeployment);
registery.register(TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT, MsgCreateDeployment);
registery.register(TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT, MsgUpdateDeployment);
registery.register(TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT, MsgDepositDeployment);
registery.register(TransactionMessageData.Types.MSG_CREATE_LEASE, MsgCreateLease);
registery.register(TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE, MsgRevokeCertificate);
registery.register(TransactionMessageData.Types.MSG_CREATE_CERTIFICATE, MsgCreateCertificate);
registery.register(TransactionMessageData.Types.MSG_SEND_TOKENS, MsgSend);

export const customRegistry = registery;

export const baseGas = "600000";
export const fees = {
  low: 4000,
  avg: 5000,
  high: 6000
};

/**
 * Get the fee object for an Akash transaction
 * @param {string} type low | avg | high
 * @param {number} gas transaction gas
 * @param {number} msgCount number of messages
 * @returns The fee object
 */
export const createFee = (type, gas = baseGas, msgCount = 1) => {
  return { gas, amount: [{ denom: "uakt", amount: (fees[type] * msgCount).toString() }] };
};

export const createCustomFee = (fee = fees["avg"], gas = baseGas, msgCount = 1) => {
  return { gas, amount: [{ denom: "uakt", amount: (fee * msgCount).toString() }] };
};
