import { Registry } from "@cosmjs/proto-signing";
import { MsgCloseDeployment, MsgRevokeCertificate, MsgCreateCertificate, MsgCreateDeployment, MsgCreateLease } from "../../ProtoAkashTypes";

const MSG_CLOSE_DEPLOYMENT = "/akash.deployment.v1beta1.MsgCloseDeployment";
const MSG_CREATE_DEPLOYMENT = "/akash.deployment.v1beta1.MsgCreateDeployment";
const MSG_CREATE_LEASE = "/akash.market.v1beta1.MsgCreateLease";
const MSG_REVOKE_CERTIFICATE = "/akash.cert.v1beta1.MsgRevokeCertificate";
const MSG_CREATE_CERTIFICATE = "/akash.cert.v1beta1.MsgCreateCertificate";

const registery = new Registry();
registery.register(MSG_CLOSE_DEPLOYMENT, MsgCloseDeployment);
registery.register(MSG_CREATE_DEPLOYMENT, MsgCreateDeployment);
registery.register(MSG_CREATE_LEASE, MsgCreateLease);
registery.register(MSG_REVOKE_CERTIFICATE, MsgRevokeCertificate);
registery.register(MSG_CREATE_CERTIFICATE, MsgCreateCertificate);

export const customRegistry = registery;

export const baseGas = 500000;
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
  return { gas, amount: [{ denom: "uakt", amount: fees[type] * msgCount }] };
};

export class TransactionMessage {
  static getRevokeCertificateMsg(address, serial) {
    const txData = {
      typeUrl: MSG_REVOKE_CERTIFICATE,
      value: {
        id: {
          owner: address,
          serial
        }
      }
    };

    const err = MsgRevokeCertificate.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getCreateCertificateMsg(address, crtpem, pubpem) {
    const txData = {
      typeUrl: MSG_CREATE_CERTIFICATE,
      value: {
        owner: address,
        cert: Buffer.from(crtpem).toString("base64"),
        pubkey: Buffer.from(pubpem).toString("base64")
      }
    };

    const err = MsgCreateCertificate.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getCreateLeaseMsg(bid) {
    const txData = {
      typeUrl: MSG_CREATE_LEASE,
      value: {
        bid_id: {
          owner: bid.owner,
          dseq: bid.dseq,
          gseq: bid.gseq,
          oseq: bid.oseq,
          provider: bid.provider
        }
      }
    };

    const err = MsgCreateLease.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getCreateDeploymentMsg(deploymentData) {
    const txData = {
      typeUrl: MSG_CREATE_DEPLOYMENT,
      value: {
        id: deploymentData.deploymentId,
        groups: deploymentData.groups,
        version: deploymentData.version,
        deposit: deploymentData.deposit
      }
    };

    const err = MsgCreateDeployment.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getCloseDeploymentMsg(address, dseq) {
    const txData = {
      typeUrl: MSG_CLOSE_DEPLOYMENT,
      value: {
        id: {
          owner: address,
          dseq: parseInt(dseq)
        }
      }
    };

    const err = MsgCloseDeployment.verify(txData.value);

    if (err) throw err;

    return txData;
  }
}
