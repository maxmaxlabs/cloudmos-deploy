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

export function createFee(gas) {
  return { ...baseFee, gas: gas };
}
