import { protoTypes } from "../protoTypes";
import { networkVersion } from "../constants";

export function setMessageTypes() {
  TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT = `/akash.deployment.${networkVersion}.MsgCloseDeployment`;
  TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT = `/akash.deployment.${networkVersion}.MsgCreateDeployment`;
  TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT = `/akash.deployment.${networkVersion}.MsgDepositDeployment`;
  TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT = `/akash.deployment.${networkVersion}.MsgUpdateDeployment`;
  TransactionMessageData.Types.MSG_CREATE_LEASE = `/akash.market.${networkVersion}.MsgCreateLease`;
  TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE = `/akash.cert.${networkVersion}.MsgRevokeCertificate`;
  TransactionMessageData.Types.MSG_CREATE_CERTIFICATE = `/akash.cert.${networkVersion}.MsgCreateCertificate`;
}

export class TransactionMessageData {
  static Types = {
    MSG_CLOSE_DEPLOYMENT: "",
    MSG_CREATE_DEPLOYMENT: "",
    MSG_DEPOSIT_DEPLOYMENT: "",
    MSG_UPDATE_DEPLOYMENT: "",
    // TODO MsgCloseGroup
    // TODO MsgPauseGroup
    // TODO MsgStartGroup
    MSG_CREATE_LEASE: "",
    MSG_REVOKE_CERTIFICATE: "",
    MSG_CREATE_CERTIFICATE: "",

    // Cosmos
    MSG_SEND_TOKENS: "/cosmos.bank.v1beta1.MsgSend"
  };

  static getRevokeCertificateMsg(address, serial) {
    const txData = {
      typeUrl: TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE,
      value: {
        id: {
          owner: address,
          serial
        }
      }
    };

    const err = protoTypes.MsgRevokeCertificate.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getCreateCertificateMsg(address, crtpem, pubpem) {
    const txData = {
      typeUrl: TransactionMessageData.Types.MSG_CREATE_CERTIFICATE,
      value: {
        owner: address,
        cert: Buffer.from(crtpem).toString("base64"),
        pubkey: Buffer.from(pubpem).toString("base64")
      }
    };

    const err = protoTypes.MsgCreateCertificate.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getCreateLeaseMsg(bid) {
    const txData = {
      typeUrl: TransactionMessageData.Types.MSG_CREATE_LEASE,
      value: {
        bid_id: {
          owner: bid.owner,
          dseq: parseInt(bid.dseq),
          gseq: bid.gseq,
          oseq: bid.oseq,
          provider: bid.provider
        }
      }
    };

    const err = protoTypes.MsgCreateLease.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getCreateDeploymentMsg(deploymentData) {
    const txData = {
      typeUrl: TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT,
      value: {
        id: deploymentData.deploymentId,
        groups: deploymentData.groups,
        version: deploymentData.version,
        deposit: deploymentData.deposit
      }
    };

    const err = protoTypes.MsgCreateDeployment.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getUpdateDeploymentMsg(deploymentData) {
    const txData = {
      typeUrl: TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT,
      value: {
        id: deploymentData.deploymentId,
        groups: deploymentData.groups,
        version: deploymentData.version
      }
    };

    const err = protoTypes.MsgUpdateDeployment.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getDepositDeploymentMsg(address, dseq, depositAmount) {
    const txData = {
      typeUrl: TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT,
      value: {
        id: {
          owner: address,
          dseq: parseInt(dseq)
        },
        amount: {
          denom: "uakt",
          amount: depositAmount.toString()
        }
      }
    };

    const err = protoTypes.MsgDepositDeployment.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getCloseDeploymentMsg(address, dseq) {
    const txData = {
      typeUrl: TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT,
      value: {
        id: {
          owner: address,
          dseq: parseInt(dseq)
        }
      }
    };

    const err = protoTypes.MsgCloseDeployment.verify(txData.value);

    if (err) throw err;

    return txData;
  }

  static getSendTokensMsg(address, recipient, amount) {
    const txData = {
      typeUrl: TransactionMessageData.Types.MSG_SEND_TOKENS,
      value: {
        fromAddress: address,
        toAddress: recipient,
        amount: [
          {
            denom: "uakt",
            amount: amount.toString()
          }
        ]
      }
    };

    return txData;
  }
}
