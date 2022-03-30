import { useEffect, useRef, useState } from "react";
import { useCertificate } from "../../context/CertificateProvider";
import { makeStyles, Checkbox, FormControlLabel, FormGroup, Box, Button, CircularProgress } from "@material-ui/core";
import { useProviders } from "../../queries";
import MonacoEditor from "react-monaco-editor";
import { ToggleButtonGroup, ToggleButton, Alert } from "@material-ui/lab";
import * as monaco from "monaco-editor";
import { monacoOptions } from "../../shared/constants";
import { ViewPanel } from "../../shared/components/ViewPanel";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { useDebouncedCallback } from "../../hooks/useThrottle";
import { useAsyncTask } from "../../context/AsyncTaskProvider";

const useStyles = makeStyles((theme) => ({
  leaseSelector: {
    margin: theme.spacing(1)
  },
  root: {
    "& .MuiToggleButton-root": {
      color: "rgba(0, 0, 0, 0.54)",
      fontWeight: "bold",
      "&.Mui-selected": {
        color: "rgb(25, 118, 210)",
        backgroundColor: "rgba(25, 118, 210, 0.08)"
      }
    }
  }
}));

export function DeploymentLogs({ leases, selectedLogsMode, setSelectedLogsMode }) {
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const logs = useRef([]);
  const [logText, setLogText] = useState("");
  const [isDownloadingLogs, setIsDownloadingLogs] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [selectedLease, setSelectedLease] = useState(null);
  const classes = useStyles();
  const { data: providers } = useProviders();
  const { localCert, isLocalCertMatching } = useCertificate();
  const monacoRef = useRef();
  const { launchAsyncTask } = useAsyncTask();

  const options = {
    ...monacoOptions,
    readOnly: true
  };

  const updateLogText = useDebouncedCallback(
    () => {
      const logText = logs.current.map((x) => x.message).join("\n");
      setLogText(logText);
      setIsLoadingLogs(false);
    },
    [],
    1000
  );

  useEffect(() => {
    if (!leases || leases.length === 0) return;

    setSelectedLease(leases[0]);
  }, [leases]);

  useEffect(() => {
    if (!selectedLease || !providers || providers.length === 0) return;

    (async () => {
      const providerInfo = providers?.find((p) => p.owner === selectedLease.provider);

      if (!providerInfo) return;

      const leaseStatusPath = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/status`;
      const leaseStatus = await window.electron.queryProvider(leaseStatusPath, "GET", null, localCert.certPem, localCert.keyPem);

      setServices(Object.keys(leaseStatus.services));
      setSelectedServices(Object.keys(leaseStatus.services));
    })();
  }, [selectedLease, providers, localCert?.certPem, localCert?.keyPem]);

  useEffect(() => {
    if (!providers) return;
    if (!isLocalCertMatching) return;
    if (!selectedLease) return;

    logs.current = [];

    const providerInfo = providers?.find((p) => p.owner === selectedLease.provider);

    let url = null;
    if (selectedLogsMode === "logs") {
      url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/logs?follow=true&tail=100`;

      if (selectedServices.length < services.length) {
        url += "&service=" + selectedServices.join(",");
      }
    } else {
      url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/kubeevents?follow=true`;
    }

    const socket = window.electron.openWebSocket(url, localCert.certPem, localCert.keyPem, (message) => {
      setIsLoadingLogs(true);

      let parsedLog = null;
      if (selectedLogsMode === "logs") {
        parsedLog = JSON.parse(message);
        parsedLog.service = parsedLog.name.split("-")[0];
        parsedLog.message = parsedLog.service + ": " + parsedLog.message;
      } else {
        parsedLog = JSON.parse(message);
        parsedLog.service = parsedLog.object.name.split("-")[0];
        parsedLog.message = `${parsedLog.service}: ${parsedLog.time} [${parsedLog.type}] [${parsedLog.reason}] [${parsedLog.object.kind}] ${parsedLog.note}`;
      }

      logs.current = logs.current.concat([parsedLog]);

      updateLogText();
    });

    return () => {
      socket.close();
    };
  }, [
    leases,
    providers,
    isLocalCertMatching,
    selectedLogsMode,
    selectedLease,
    selectedServices,
    localCert.certPem,
    localCert.keyPem,
    services?.length,
    updateLogText
  ]);

  function setServiceCheck(service, isChecked) {
    if (isChecked) {
      setSelectedServices([...selectedServices, service]);
    } else {
      setSelectedServices((selectedServices) => selectedServices.filter((x) => x !== service));
    }
  }

  useEffect(() => {
    if (stickToBottom && monacoRef.current) {
      const editor = monacoRef.current.editor;
      // Immediate scroll type, scroll to bottom
      editor.revealLine(editor.getModel().getLineCount(), 1);
      // Clear selection
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
  }, [logText, stickToBottom]);

  function handleModeChange(ev, val) {
    if (val) {
      setSelectedLogsMode(val);

      if (selectedLogsMode !== val) {
        setLogText("");
        setIsLoadingLogs(true);
      }
    }
  }

  function handleLeaseChange(ev, val) {
    setSelectedLease(leases.find((x) => x.id === val));
  }

  const onDownloadLogsClick = async () => {
    setIsDownloadingLogs(true);

    const providerInfo = providers?.find((p) => p.owner === selectedLease.provider);

    await launchAsyncTask(
      async () => {
        const url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/logs?follow=true&tail=10000000`;

        const appPath = await window.electron.appPath();
        const filePath = await window.electron.downloadLogs(
          appPath,
          url,
          localCert.certPem,
          localCert.keyPem,
          `${selectedLease.dseq}_${selectedLease.gseq}_${selectedLease.oseq}`
        );

        const res = await window.electron.saveLogFile(filePath);

        setIsDownloadingLogs(false);

        console.log("success", res);
      },
      () => {
        // Cancelled
        window.electron.cancelSaveLogs();
        setIsDownloadingLogs(false);
      },
      "Downloading logs..."
    );
  };

  return (
    <div className={classes.root}>
      {isLocalCertMatching ? (
        <>
          {selectedLease && (
            <>
              <Box display="flex" alignItems="center" justifyContent="space-between" padding=".2rem .5rem">
                <div>
                  {leases?.length > 1 && (
                    <ToggleButtonGroup className={classes.leaseSelector} color="primary" value={selectedLease.id} exclusive onChange={handleLeaseChange}>
                      {leases.map((l) => (
                        <ToggleButton key={l.id} value={l.id} size="small">
                          GSEQ: {l.gseq}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}

                  <ToggleButtonGroup color="primary" value={selectedLogsMode} exclusive onChange={handleModeChange}>
                    <ToggleButton value="logs" size="small">
                      Logs
                    </ToggleButton>
                    <ToggleButton value="events" size="small">
                      Events
                    </ToggleButton>
                  </ToggleButtonGroup>
                </div>

                <Box display="flex" alignItems="center">
                  {localCert && (
                    <Box marginRight="1rem">
                      <Button onClick={onDownloadLogsClick} variant="contained" size="small" color="primary" disabled={isDownloadingLogs}>
                        {isDownloadingLogs ? <CircularProgress size="1.5rem" color="primary" /> : "Download logs"}
                      </Button>
                    </Box>
                  )}
                  <FormControlLabel
                    control={<Checkbox color="primary" checked={stickToBottom} onChange={(ev) => setStickToBottom(ev.target.checked)} />}
                    label={"Stick to bottom"}
                  />
                </Box>
              </Box>

              {services?.length > 1 && (
                <FormGroup row>
                  {services.map((service) => (
                    <FormControlLabel
                      key={service}
                      disabled={selectedLogsMode !== "logs"}
                      control={
                        <Checkbox color="primary" checked={selectedServices.includes(service)} onChange={(ev) => setServiceCheck(service, ev.target.checked)} />
                      }
                      label={service}
                    />
                  ))}
                </FormGroup>
              )}

              <LinearLoadingSkeleton isLoading={isLoadingLogs} />

              <ViewPanel bottomElementId="footer" overflow="hidden">
                <MonacoEditor ref={monacoRef} theme="vs-dark" value={logText} options={options} />
              </ViewPanel>
            </>
          )}
        </>
      ) : (
        <Box mt={1}>
          <Alert severity="info">You need a valid certificate to view deployment logs.</Alert>
        </Box>
      )}
    </div>
  );
}
