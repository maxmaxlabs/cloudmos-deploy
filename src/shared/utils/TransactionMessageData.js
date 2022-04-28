import { protoTypes } from "../protoTypes";
import { networkVersion } from "../constants";

export function setMessageTypes() {
  TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT.type = `/akash.deployment.${networkVersion}.MsgCloseDeployment`;
  TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT.type = `/akash.deployment.${networkVersion}.MsgCreateDeployment`;
  TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT.type = `/akash.deployment.${networkVersion}.MsgDepositDeployment`;
  TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT.type = `/akash.deployment.${networkVersion}.MsgUpdateDeployment`;
  TransactionMessageData.Types.MSG_CREATE_LEASE.type = `/akash.market.${networkVersion}.MsgCreateLease`;
  TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE.type = `/akash.cert.${networkVersion}.MsgRevokeCertificate`;
  TransactionMessageData.Types.MSG_CREATE_CERTIFICATE.type = `/akash.cert.${networkVersion}.MsgCreateCertificate`;
}

export class TransactionMessageData {
  static Types = {
    MSG_CLOSE_DEPLOYMENT: { type: "", gas: 600000 },
    MSG_CREATE_DEPLOYMENT: { type: "", gas: 500000 },
    MSG_DEPOSIT_DEPLOYMENT: { type: "", gas: 300000 },
    MSG_UPDATE_DEPLOYMENT: { type: "", gas: 300000 },
    // TODO MsgCloseGroup
    // TODO MsgPauseGroup
    // TODO MsgStartGroup
    MSG_CREATE_LEASE: { type: "", gas: 1000000 },
    MSG_REVOKE_CERTIFICATE: { type: "", gas: 300000 },
    MSG_CREATE_CERTIFICATE: { type: "", gas: 300000 },

    // Cosmos
    MSG_SEND_TOKENS: { type: "/cosmos.bank.v1beta1.MsgSend", gas: 300000 },
    MSG_GRANT: { type: "/cosmos.authz.v1beta1.MsgGrant", gas: 300000 }
  };

  static getRevokeCertificateMsg(address, serial) {
    const message = {
      typeUrl: TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE.type,
      value: {
        id: {
          owner: address,
          serial
        }
      }
    };

    const err = protoTypes.MsgRevokeCertificate.verify(message.value);

    if (err) throw err;

    return { message, gas: TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE.gas };
  }

  static getCreateCertificateMsg(address, crtpem, pubpem) {
    const message = {
      typeUrl: TransactionMessageData.Types.MSG_CREATE_CERTIFICATE.type,
      value: {
        owner: address,
        cert: Buffer.from(crtpem).toString("base64"),
        pubkey: Buffer.from(pubpem).toString("base64")
      }
    };

    const err = protoTypes.MsgCreateCertificate.verify(message.value);

    if (err) throw err;

    return { message, gas: TransactionMessageData.Types.MSG_CREATE_CERTIFICATE.gas };
  }

  static getCreateLeaseMsg(bid) {
    const message = {
      typeUrl: TransactionMessageData.Types.MSG_CREATE_LEASE.type,
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

    const err = protoTypes.MsgCreateLease.verify(message.value);

    if (err) throw err;

    return { message, gas: TransactionMessageData.Types.MSG_CREATE_LEASE.gas };
  }

  static getCreateDeploymentMsg(deploymentData) {
    const message = {
      typeUrl: TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT.type,
      value: {
        id: deploymentData.deploymentId,
        groups: deploymentData.groups,
        version: deploymentData.version,
        deposit: deploymentData.deposit,
        depositor: deploymentData.depositor
      }
    };

    // TODO
    //const err = protoTypes.MsgCreateDeployment.verify(txData.value);
    let err = null;
    if (err) throw err;

    return { message, gas: TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT.gas };
  }

  static getUpdateDeploymentMsg(deploymentData) {
    const message = {
      typeUrl: TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT.type,
      value: {
        id: deploymentData.deploymentId,
        version: deploymentData.version
      }
    };

    // const err = protoTypes.MsgUpdateDeployment.verify(txData.value);

    let err = null;
    if (err) throw err;

    return { message, gas: TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT.gas };
  }

  static getDepositDeploymentMsg(address, dseq, depositAmount, depositorAddress = null) {
    let message = {
      typeUrl: TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT.type,
      value: {
        id: {
          owner: address,
          dseq: parseInt(dseq)
        },
        amount: {
          denom: "uakt",
          amount: depositAmount.toString()
        },
        depositor: depositorAddress || address
      }
    };

    const err = protoTypes.MsgDepositDeployment.verify(message.value);

    if (err) throw err;

    return { message, gas: TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT.gas };
  }

  static getCloseDeploymentMsg(address, dseq) {
    const message = {
      typeUrl: TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT.type,
      value: {
        id: {
          owner: address,
          dseq: parseInt(dseq)
        }
      }
    };

    const err = protoTypes.MsgCloseDeployment.verify(message.value);

    if (err) throw err;

    return { message, gas: TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT.gas };
  }

  static getSendTokensMsg(address, recipient, amount) {
    const message = {
      typeUrl: TransactionMessageData.Types.MSG_SEND_TOKENS.type,
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

    return { message, gas: TransactionMessageData.Types.MSG_SEND_TOKENS.gas };
  }

  static getGrantMsg(granter, grantee, spendLimit, expiration) {
    const message = {
      typeUrl: TransactionMessageData.Types.MSG_GRANT.type,
      value: {
        granter: granter,
        grantee: grantee,
        grant: {
          authorization: {
            type_url: "/akash.deployment.v1beta2.DepositDeploymentAuthorization",
            value: {
              spend_limit: {
                denom: "uakt",
                amount: spendLimit.toString()
              }
            }
          },
          expiration: {
            seconds: Math.floor(expiration.getTime() / 1_000), // Convert milliseconds to seconds
            nanos: Math.floor((expiration.getTime() % 1_000) * 1_000_000) // Convert reminder into nanoseconds
          }
        }
      }
    };

    return { message, gas: TransactionMessageData.Types.MSG_GRANT.gas };
  }
}
