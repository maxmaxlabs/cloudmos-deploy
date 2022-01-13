import React from "react";
import { useEffect, useState } from "react";
import {
  makeStyles,
  IconButton,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Button
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";
import { getAvgCostPerMonth } from "../../shared/utils/priceUtils";
import { SpecDetail } from "../../shared/components/SpecDetail";
import { useCertificate } from "../../context/CertificateProvider";
import { copyTextToClipboard } from "../../shared/utils/copyClipboard";
import { useSnackbar } from "notistack";
import { useLeaseStatus } from "../../queries/useLeaseQuery";
import { useProviders } from "../../queries";
import { sendManifestToProvider, Manifest } from "../../shared/utils/deploymentUtils";
import { ManifestErrorSnackbar } from "../../shared/components/ManifestErrorSnackbar";
import { Snackbar } from "../../shared/components/Snackbar";

const yaml = require("js-yaml");

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

export const LeaseRow = React.forwardRef(({ lease, setActiveTab, deploymentManifest, dseq }, ref) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: providers } = useProviders();
  const providerInfo = providers?.find((p) => p.owner === lease?.provider);
  const { localCert } = useCertificate();
  const isLeaseActive = lease.state === "active";
  const {
    data: leaseStatus,
    error,
    refetch: getLeaseStatus,
    isLoading: isLoadingLeaseStatus
  } = useLeaseStatus(providerInfo?.host_uri, lease, { enabled: false });
  const isLeaseNotFound = error && error.includes && error.includes("lease not found") && isLeaseActive;
  const servicesNames = leaseStatus ? Object.keys(leaseStatus.services) : [];
  const classes = useStyles();
  const [isSendingManifest, setIsSendingManifest] = useState(false);

  React.useImperativeHandle(ref, () => ({
    getLeaseStatus: loadLeaseStatus
  }));

  useEffect(() => {
    loadLeaseStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lease, providerInfo, localCert]);

  function loadLeaseStatus() {
    if (isLeaseActive && providerInfo && localCert) {
      getLeaseStatus();
    }
  }

  function handleExternalUrlClick(ev, externalUrl) {
    ev.preventDefault();

    window.electron.openUrl("http://" + externalUrl);
  }

  function handleEditManifestClick(ev) {
    ev.preventDefault();
    setActiveTab("EDIT");
  }

  async function sendManifest() {
    setIsSendingManifest(true);
    try {
      const doc = yaml.load(deploymentManifest);
      const manifest = Manifest(doc);

      await sendManifestToProvider(providerInfo, manifest, dseq, localCert);

      enqueueSnackbar(<Snackbar title="Manifest sent!" />, { variant: "success", autoHideDuration: 10_000 });
    } catch (err) {
      enqueueSnackbar(<ManifestErrorSnackbar err={err} />, { variant: "error", autoHideDuration: null });
    }
    setIsSendingManifest(false);
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

        {isLeaseNotFound && (
          <Alert severity="warning">
            The lease was not found on this provider. This can happen if no manifest was sent to the provider. To send one you can update your deployment in the{" "}
            <a href="#" onClick={handleEditManifestClick}>
              VIEW / EDIT MANIFEST
            </a>{" "}
            tab.
            {deploymentManifest && (
              <>
                <Box margin="1rem 0">
                  <strong>OR</strong>
                </Box>
                <Button variant="contained" color="primary" disabled={isSendingManifest} onClick={sendManifest}>
                  {isSendingManifest ? <CircularProgress size="1.5rem" /> : <span>Send manifest manually</span>}
                </Button>
              </>
            )}
          </Alert>
        )}

        {!leaseStatus && isLoadingLeaseStatus && <CircularProgress size="1rem" />}

        {isLeaseActive &&
          leaseStatus &&
          leaseStatus.services &&
          servicesNames
            .map((n) => leaseStatus.services[n])
            .map((service, i) => (
              <Box mb={2} key={`${service.name}_${i}`}>
                <Typography variant="h6" className={classes.title}>
                  Group "{service.name}"
                </Typography>
                Available: {service.available}
                <br />
                Ready Replicas: {service.available}
                <br />
                Total: {service.available}
                <br />
                {leaseStatus.forwarded_ports[service.name]?.length > 0 && (
                  <>
                    Forwarded Ports:{" "}
                    {leaseStatus.forwarded_ports[service.name].map((p) => (
                      <Box key={"port_" + p.externalPort} display="inline" mr={0.5}>
                        <Chip
                          variant="outlined"
                          size="small"
                          label={`${p.externalPort}:${p.port}`}
                          disabled={p.available < 1}
                          component="a"
                          onClick={(ev) => handleExternalUrlClick(ev, `${p.host}:${p.externalPort}`)}
                        />
                      </Box>
                    ))}
                  </>
                )}
                {service.uris?.length > 0 && (
                  <List dense>
                    {service.uris.map((uri) => {
                      return (
                        <ListItem key={uri} component="a" button onClick={(ev) => handleExternalUrlClick(ev, uri)}>
                          <ListItemText primary={uri} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="uri"
                              onClick={(ev) => {
                                copyTextToClipboard(uri);
                                enqueueSnackbar("Uri copied to clipboard!", {
                                  variant: "success",
                                  autoHideDuration: 2000
                                });
                              }}
                            >
                              <FileCopyIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            ))}
      </CardContent>
    </Card>
  );
});
