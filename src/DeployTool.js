import React, { useState } from "react";
import { WalletDisplay } from "./WalletDisplay";
import { makeStyles, Grid } from '@material-ui/core';
import { DeploymentList } from "./DeploymentList";
import { CertificateDisplay } from "./CertificateDisplay";
import { DeploymentDetail } from "./DeploymentDetail";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
}));

export function DeployTool(props) {
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const { selectedWallet, address } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container pt={2} spacing={1}>
        <Grid item xs={6}>
          <WalletDisplay selectedWallet={selectedWallet} address={address} />
        </Grid>

        <Grid item xs={6}>
          <CertificateDisplay selectedWallet={selectedWallet} address={address} />
        </Grid>

        <Grid item xs={6}>
          <DeploymentList address={address} selectedWallet={selectedWallet} onOpenDeployment={d => setSelectedDeployment(d)} />
        </Grid>
        <Grid item xs={6}>
          {selectedDeployment && <DeploymentDetail address={address} selectedWallet={selectedWallet} deployment={selectedDeployment} />}
        </Grid>
      </Grid>
    </div >
  )
}