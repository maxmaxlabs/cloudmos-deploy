import { useState, useEffect } from "react";
import { fetchProviderInfo } from "../../shared/providerCache";
import {
  makeStyles,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@material-ui/core";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";
import { getAvgCostPerMonth } from "../../shared/utils/priceUtils";
import { SpecDetail } from "../../shared/components/SpecDetail";
import LaunchIcon from "@material-ui/icons/Launch";
import { useCertificate } from "../../context/CertificateProvider/CertificateProviderContext";

const useStyles = makeStyles((theme) => ({
  root: {},
  cardHeader: {
    borderBottom: "1px solid rgba(0,0,0,0.1)"
  },
  cardHeaderTitle: {
    fontSize: "18px"
  },
  title: {}
}));

export function LeaseRow(props) {
  const { lease } = props;
  const [providerInfo, setProviderInfo] = useState(null);
  const [leaseInfoFromProvider, setLeaseInfoFromProvider] = useState(null);

  const { localCert } = useCertificate();

  console.log(lease);

  const classes = useStyles();

  useEffect(() => {
    async function loadProviderInfo() {
      const providerInfo = await fetchProviderInfo(lease.provider);
      console.log("providerInfo", providerInfo);
      setProviderInfo(providerInfo);
    }

    if (localCert) {
      loadProviderInfo();
    }
  }, [lease, localCert]);

  useEffect(() => {
    async function loadLeaseDetailsFromProvider() {
      const leaseStatusPath = `${providerInfo.host_uri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/status`;
      const response = await window.electron.queryProvider(leaseStatusPath, "GET", null, localCert.certPem, localCert.keyPem);
      console.log("leaseDetail", response);
      setLeaseInfoFromProvider(response);
    }

    if (lease.state === "active" && providerInfo && localCert) {
      loadLeaseDetailsFromProvider();
    }
  }, [lease, providerInfo, localCert]);

  function handleExternalUrlClick(ev, externalUrl) {
    ev.preventDefault();

    window.electron.openUrl("http://" + externalUrl);
  }

  return (
    <Card className={classes.root}>
      <CardHeader
        classes={{ title: classes.cardHeaderTitle, root: classes.cardHeader }}
        title={
          <Box display="flex">
            <LabelValue label="GSEQ:" value={lease.gseq} />
            <LabelValue label="OSEQ:" value={lease.oseq} marginLeft="1rem" />
            <LabelValue
              label="Status:"
              value={
                <>
                  <div>{lease.state}</div>
                  <StatusPill state={lease.state} />
                </>
              }
              marginLeft="1rem"
            />
          </Box>
        }
        // action={`action`}
      />
      <CardContent>
        <LabelValue
          label="Price:"
          value={
            <>
              {lease.price.amount}uakt ({`~${getAvgCostPerMonth(lease.price.amount)}akt/month`})
            </>
          }
        />
        <LabelValue label="Provider:" value={lease.provider} marginTop="5px" />

        <SpecDetail cpuAmount={lease.cpuAmount} memoryAmount={lease.memoryAmount} storageAmount={lease.storageAmount} />

        {leaseInfoFromProvider?.services?.web?.uris?.length > 0 && (
          <>
            <Typography variant="h4" className={classes.title}>
              Uris
            </Typography>

            <List dense>
              {leaseInfoFromProvider.services.web.uris.map((uri) => {
                return (
                  <ListItem key={uri}>
                    <ListItemText primary={uri} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="uri" onClick={(ev) => handleExternalUrlClick(ev, uri)}>
                        <LaunchIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}
