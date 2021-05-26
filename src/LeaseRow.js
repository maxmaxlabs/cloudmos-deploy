import { useState, useEffect } from "react";
import { fetchProviderInfo } from "./shared/providerCache";
import PublishIcon from '@material-ui/icons/Publish';
import LaunchIcon from '@material-ui/icons/Launch';
import {
  makeStyles,
  IconButton,
  CardActions,
  Card,
  CardContent,
  CardHeader
} from "@material-ui/core";

//const yaml = require('js-yaml');

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiCardHeader-title": {
      fontSize: "18px"
    }
  },
}));

export function LeaseRow(props) {
  const [providerInfo, setProviderInfo] = useState(null);
  const [leaseInfoFromProvider, setLeaseInfoFromProvider] = useState(null);

  const classes = useStyles();

  const { lease, cert } = props;

  useEffect(() => {
    async function loadProviderInfo() {
      const providerInfo = await fetchProviderInfo(lease.provider);
      setProviderInfo(providerInfo);
    }

    if (cert) {
      loadProviderInfo();
    }
  }, [lease, cert]);

  useEffect(() => {
    async function loadLeaseDetailsFromProvider() {
      const leaseStatusPath = `${providerInfo.host_uri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/status`;
      const response = await window.electron.queryProvider(leaseStatusPath, "GET", null, cert.certPem, cert.keyPem);
      setLeaseInfoFromProvider(response);
    }

    if (lease.state === "active" && providerInfo && cert) {
      loadLeaseDetailsFromProvider();
    }
  }, [lease, providerInfo, cert])

  async function sendManifest(dseq) {
    // const flags = {};
    // const response = await fetch(DemoDeployYaml);
    // const txt = await response.text();
    // const doc = yaml.load(txt);

    // const mani = Manifest(doc);

    // const prvKeyPem = localStorage.getItem("DeploymentCertificatePrivateKey");
    // const certPem = localStorage.getItem("DeploymentCertificate");

    // var cert = new rs.X509();
    // cert.readCertPEM(certPem);

    // //JSON.stringify(mani);
  }

  let externalUrl = leaseInfoFromProvider?.services?.web?.uris[0];

  function handleExternalUrlClick(ev) {
    ev.preventDefault();

    window.electron.openUrl("http://" + externalUrl);
  }

  return (
    <Card className={classes.root}>
      <CardHeader
        title={"GSEQ: " + lease.gseq + " OSEQ: " + lease.oseq}
        subheader={lease.state}
        action={
          <>
            {externalUrl && (<IconButton onClick={handleExternalUrlClick}><LaunchIcon /></IconButton>)}
          </>
        } />
      <CardContent>
        Provider:<br />
        {lease.provider}
      </CardContent>
      <CardActions disableSpacing>
        <IconButton edge="end" onClick={() => sendManifest(lease.dseq)}>
          <PublishIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}