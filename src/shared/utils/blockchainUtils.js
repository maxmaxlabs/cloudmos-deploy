import { Registry } from "@cosmjs/proto-signing";
import { MsgCloseDeployment, MsgRevokeCertificate, MsgCreateCertificate, MsgCreateDeployment, MsgCreateLease } from "../../ProtoAkashTypes";

const registery = new Registry();
registery.register("/akash.deployment.v1beta1.MsgCloseDeployment", MsgCloseDeployment);
registery.register("/akash.deployment.v1beta1.MsgCreateDeployment", MsgCreateDeployment);
registery.register("/akash.market.v1beta1.MsgCreateLease", MsgCreateLease);
registery.register("/akash.cert.v1beta1.MsgRevokeCertificate", MsgRevokeCertificate);
registery.register("/akash.cert.v1beta1.MsgCreateCertificate", MsgCreateCertificate);

export const customRegistry = registery;

export const baseFee = {
  gas: "200000",
  amount: [
    {
      denom: "uakt",
      amount: "1200"
    }
  ]
};

export const baseGas = 700000;

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
export function createFee(type, gas = baseGas, msgCount = 1) {
  return { gas, amount: [{ denom: "uakt", amount: fees[type] * msgCount }] };
}
