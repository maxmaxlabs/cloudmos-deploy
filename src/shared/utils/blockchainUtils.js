import { Registry } from "@cosmjs/proto-signing";
import { MsgCloseDeployment, MsgRevokeCertificate, MsgCreateCertificate, MsgCreateDeployment, MsgCreateLease } from "../ProtoAkashTypes";
import { TransactionMessageData } from "./TransactionMessageData";

const registery = new Registry();
registery.register(TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT, MsgCloseDeployment);
registery.register(TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT, MsgCreateDeployment);
registery.register(TransactionMessageData.Types.MSG_CREATE_LEASE, MsgCreateLease);
registery.register(TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE, MsgRevokeCertificate);
registery.register(TransactionMessageData.Types.MSG_CREATE_CERTIFICATE, MsgCreateCertificate);

export const customRegistry = registery;

export const baseGas = "500000";
export const fees = {
  low: 1400,
  avg: 3500,
  high: 5600
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
