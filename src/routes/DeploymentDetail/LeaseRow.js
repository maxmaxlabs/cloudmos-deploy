import React, { useCallback } from "react";
import { useEffect, useState } from "react";
import {
  makeStyles,
  IconButton,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Button,
  Tooltip,
  Typography,
  Chip
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";
import { getAvgCostPerMonth, uaktToAKT } from "../../shared/utils/priceUtils";
import { SpecDetail } from "../../shared/components/SpecDetail";
import { useCertificate } from "../../context/CertificateProvider";
import { copyTextToClipboard } from "../../shared/utils/copyClipboard";
import { useSnackbar } from "notistack";
import { useProviders, useLeaseStatus, useProviderStatus } from "../../queries";
import { sendManifestToProvider } from "../../shared/utils/deploymentUtils";
import { deploymentData } from "../../shared/deploymentData";
import { ManifestErrorSnackbar } from "../../shared/components/ManifestErrorSnackbar";
import { Snackbar } from "../../shared/components/Snackbar";
import { LinkTo } from "../../shared/components/LinkTo";
import { PricePerMonth } from "../../shared/components/PricePerMonth";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";
import LaunchIcon from "@material-ui/icons/Launch";
import InfoIcon from "@material-ui/icons/Info";
import { ProviderAttributes } from "../../shared/components/ProviderAttributes";
import { ProviderDetailModal } from "../../components/ProviderDetail";
import { FormattedNumber } from "react-intl";
import { FavoriteButton } from "../../shared/components/FavoriteButton";
import { useLocalNotes } from "../../context/LocalNoteProvider";

const yaml = require("js-yaml");

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: "1rem"
  },
  cardHeader: {
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    padding: ".5rem 1rem",
    backgroundColor: theme.palette.grey[100]
  },
  cardHeaderTitle: {
    fontSize: "18px"
  },
  listItem: {
    borderBottom: `1px solid ${theme.palette.grey[300]}`
  },
  link: {
    display: "flex",
    alignItems: "center"
  },
  tooltip: {
    fontSize: "1rem"
  },
  tooltipIcon: {
    fontSize: "1rem",
    color: theme.palette.grey[600]
  },
  whiteLink: {
    fontWeight: "bold",
    color: theme.palette.common.white
  },
  marginLeft: {
    marginLeft: "1rem"
  },
  serviceChip: {
    height: ".875rem",
    lineHeight: ".875rem",
    fontSize: ".5rem",
    fontWeight: "bold"
  }
}));

export const LeaseRow = React.forwardRef(({ lease, setActiveTab, deploymentManifest, dseq }, ref) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: providers } = useProviders();
  const providerInfo = providers?.find((p) => p.owner === lease?.provider);
  const { localCert } = useCertificate();
  const isLeaseActive = lease.state === "active";
  const [isServicesAvailable, setIsServicesAvailable] = useState(false);
  const { favoriteProviders, updateFavoriteProviders } = useLocalNotes();
  const [isViewingProviderDetail, setIsViewingProviderDetail] = useState(false);
  const isFavorite = favoriteProviders.some((x) => lease?.provider === x);
  const {
    data: leaseStatus,
    error,
    refetch: getLeaseStatus,
    isLoading: isLoadingLeaseStatus
  } = useLeaseStatus(providerInfo?.host_uri, lease, {
    enabled: isLeaseActive && !isServicesAvailable && !!providerInfo?.host_uri && !!localCert,
    refetchInterval: 10_000,
    onSuccess: (leaseStatus) => {
      if (leaseStatus) {
        checkIfServicesAreAvailable(leaseStatus);
      }
    }
  });
  const {
    data: providerStatus,
    isLoading: isLoadingProviderStatus,
    refetch: getProviderStatus
  } = useProviderStatus(providerInfo?.host_uri, {
    enabled: false,
    retry: false
  });
  const isLeaseNotFound = error && error.includes && error.includes("lease not found") && isLeaseActive;
  const servicesNames = leaseStatus ? Object.keys(leaseStatus.services) : [];
  const classes = useStyles();
  const [isSendingManifest, setIsSendingManifest] = useState(false);

  React.useImperativeHandle(ref, () => ({
    getLeaseStatus: loadLeaseStatus
  }));

  const loadLeaseStatus = useCallback(() => {
    if (isLeaseActive && providerInfo && localCert) {
      getLeaseStatus();
      getProviderStatus();
    }
  }, [isLeaseActive, providerInfo, localCert, getLeaseStatus, getProviderStatus]);

  const checkIfServicesAreAvailable = (leaseStatus) => {
    const servicesNames = leaseStatus ? Object.keys(leaseStatus.services) : [];
    const isServicesAvailable =
      servicesNames.length > 0
        ? servicesNames
            .map((n) => leaseStatus.services[n])
            .every((service, i) => {
              return service.available > 0;
            })
        : false;
    setIsServicesAvailable(isServicesAvailable);
  };

  useEffect(() => {
    loadLeaseStatus();
  }, [lease, providerInfo, localCert, loadLeaseStatus]);

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
      const manifest = deploymentData.Manifest(doc);

      await sendManifestToProvider(providerInfo, manifest, dseq, localCert);

      enqueueSnackbar(<Snackbar title="Manifest sent!" iconVariant="success" />, { variant: "success", autoHideDuration: 10_000 });
    } catch (err) {
      enqueueSnackbar(<ManifestErrorSnackbar err={err} iconVariant="error" />, { variant: "error", autoHideDuration: null });
    }
    setIsSendingManifest(false);
  }

  const onStarClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const newFavorites = isFavorite ? favoriteProviders.filter((x) => x !== lease.provider) : favoriteProviders.concat([lease.provider]);

    updateFavoriteProviders(newFavorites);
  };

  return (
    <>
      {isViewingProviderDetail && (
        <ProviderDetailModal provider={{ ...providerStatus, ...providerInfo }} onClose={() => setIsViewingProviderDetail(false)} address={lease.provider} />
      )}

      <Card className={classes.root} elevation={4}>
        <CardHeader
          classes={{ title: classes.cardHeaderTitle, root: classes.cardHeader }}
          title={
            <Box display="flex">
              <LabelValue
                label="Status:"
                value={
                  <>
                    <div>{lease.state}</div>
                    <StatusPill state={lease.state} size="small" />
                  </>
                }
              />
              <LabelValue label="GSEQ:" value={lease.gseq} marginLeft="1rem" fontSize="1rem" />
              <LabelValue label="OSEQ:" value={lease.oseq} marginLeft="1rem" fontSize="1rem" />

              {isLeaseActive && (
                <Box marginLeft="1rem" display="inline-flex">
                  <LinkTo onClick={() => setActiveTab("LOGS")}>View logs</LinkTo>
                </Box>
              )}
            </Box>
          }
        />
        <CardContent>
          <Box display="flex">
            <Box>
              <Box paddingBottom="1rem">
                <SpecDetail
                  cpuAmount={lease.cpuAmount}
                  memoryAmount={lease.memoryAmount}
                  storageAmount={lease.storageAmount}
                  color={isLeaseActive ? "primary" : "default"}
                />
              </Box>
              <LabelValue
                label="Price:"
                value={
                  <>
                    <PricePerMonth perBlockValue={uaktToAKT(lease.price.amount, 6)} />
                    <PriceEstimateTooltip value={uaktToAKT(lease.price.amount, 6)} />
                    <Box component="span" marginLeft=".5rem">
                      <FormattedNumber value={lease.price.amount} maximumSignificantDigits={18} />
                      uakt ({`~${getAvgCostPerMonth(lease.price.amount)}akt/month`})
                    </Box>
                  </>
                }
              />

              {isLeaseActive && (
                <LabelValue
                  label="Provider:"
                  value={
                    <>
                      {isLoadingProviderStatus && <CircularProgress size="1rem" />}
                      {providerStatus && (
                        <>
                          {providerStatus.name}

                          <Box display="flex" alignItems="center" marginLeft={1}>
                            <FavoriteButton isFavorite={isFavorite} onClick={onStarClick} />
                            <Box marginLeft=".5rem" display="flex">
                              <LinkTo onClick={() => setIsViewingProviderDetail(true)}>View details</LinkTo>
                            </Box>
                          </Box>
                        </>
                      )}
                    </>
                  }
                  marginTop="5px"
                  marginBottom=".5rem"
                />
              )}
            </Box>

            {providerInfo && (
              <Box paddingLeft="1rem" flexGrow={1}>
                <ProviderAttributes provider={providerInfo} />
              </Box>
            )}
          </Box>

          {isLeaseNotFound && (
            <Alert severity="warning">
              The lease was not found on this provider. This can happen if no manifest was sent to the provider. To send one you can update your deployment in
              the <LinkTo onClick={handleEditManifestClick}>VIEW / EDIT MANIFEST</LinkTo> tab.
              {deploymentManifest && (
                <>
                  <Box margin="1rem 0">
                    <strong>OR</strong>
                  </Box>
                  <Button variant="contained" color="primary" disabled={isSendingManifest} onClick={sendManifest} size="small">
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
                <Box mb={1} key={`${service.name}_${i}`}>
                  <Box display="flex" alignItems="center">
                    <LabelValue label="Group:" value={service.name} fontSize="1rem" />
                    {isLoadingLeaseStatus || !isServicesAvailable ? (
                      <Box display="inline-flex" marginLeft="1rem">
                        <CircularProgress size="1rem" />
                      </Box>
                    ) : (
                      <Box display="inline-flex" marginLeft=".5rem">
                        <Tooltip
                          classes={{ tooltip: classes.tooltip }}
                          arrow
                          interactive
                          title={
                            <>
                              Workloads can take some time to spin up. If you see an error when browsing the uri, it is recommended to refresh and wait a bit.
                              Check the{" "}
                              <LinkTo onClick={() => setActiveTab("LOGS")} className={classes.whiteLink}>
                                logs
                              </LinkTo>{" "}
                              for more information.
                            </>
                          }
                        >
                          <InfoIcon className={classes.tooltipIcon} fontSize="small" />
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" marginTop="2px">
                    <Box display="flex" alignItems="center">
                      <Typography variant="caption">Available:&nbsp;</Typography>
                      <Chip label={service.available} size="small" color={service.available > 0 ? "primary" : "default"} className={classes.serviceChip} />
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="caption" className={classes.marginLeft}>
                        Ready Replicas:&nbsp;
                      </Typography>
                      <Chip
                        label={service.ready_replicas}
                        size="small"
                        color={service.ready_replicas > 0 ? "primary" : "default"}
                        className={classes.serviceChip}
                      />
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography variant="caption" className={classes.marginLeft}>
                        Total:&nbsp;
                      </Typography>
                      <Chip label={service.total} size="small" color="primary" className={classes.serviceChip} />
                    </Box>
                  </Box>

                  {leaseStatus.forwarded_ports && leaseStatus.forwarded_ports[service.name]?.length > 0 && (
                    <Box marginTop="4px">
                      <LabelValue
                        label="Forwarded Ports:"
                        value={leaseStatus.forwarded_ports[service.name].map((p) => (
                          <Box key={"port_" + p.externalPort} display="inline" mr={0.5}>
                            <LinkTo label={``} disabled={p.available < 1} onClick={(ev) => handleExternalUrlClick(ev, `${p.host}:${p.externalPort}`)}>
                              {p.externalPort}:{p.port}
                            </LinkTo>
                          </Box>
                        ))}
                      />
                    </Box>
                  )}

                  {service.uris?.length > 0 && (
                    <>
                      <Box marginTop=".5rem">
                        <LabelValue label="Uris:" />
                        <List dense>
                          {service.uris.map((uri) => {
                            return (
                              <ListItem key={uri} className={classes.listItem}>
                                <ListItemText
                                  primary={
                                    <LinkTo className={classes.link} onClick={(ev) => handleExternalUrlClick(ev, uri)}>
                                      {uri} <LaunchIcon fontSize="small" />
                                    </LinkTo>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    aria-label="uri"
                                    size="small"
                                    onClick={(ev) => {
                                      copyTextToClipboard(uri);
                                      enqueueSnackbar(<Snackbar title="Uri copied to clipboard!" iconVariant="success" />, {
                                        variant: "success",
                                        autoHideDuration: 2000
                                      });
                                    }}
                                  >
                                    <FileCopyIcon fontSize="small" />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Box>
                    </>
                  )}
                </Box>
              ))}
        </CardContent>
      </Card>
    </>
  );
});
