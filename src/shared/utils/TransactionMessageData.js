import { MsgCloseDeployment, MsgRevokeCertificate, MsgCreateCertificate, MsgCreateDeployment, MsgCreateLease } from "../ProtoAkashTypes";

export class TransactionMessageData {
  static Types = {
    MSG_CLOSE_DEPLOYMENT: "/akash.deployment.v1beta1.MsgCloseDeployment",
    MSG_CREATE_DEPLOYMENT: "/akash.deployment.v1beta1.MsgCreateDeployment",
    MSG_CREATE_LEASE: "/akash.market.v1beta1.MsgCreateLease",
    MSG_REVOKE_CERTIFICATE: "/akash.cert.v1beta1.MsgRevokeCertificate",
    MSG_CREATE_CERTIFICATE: "/akash.cert.v1beta1.MsgCreateCertificate"
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

    const err = MsgRevokeCertificate.verify(txData.value);

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

    const err = MsgCreateCertificate.verify(txData.value);

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

    const err = MsgCreateLease.verify(txData.value);

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

    const err = MsgCreateDeployment.verify(txData.value);

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

    const err = MsgCloseDeployment.verify(txData.value);

    if (err) throw err;

    return txData;
  }
}
