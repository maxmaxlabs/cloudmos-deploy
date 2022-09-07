import { useEffect, useRef, useState } from "react";
import { useCertificate } from "../../context/CertificateProvider";
import { makeStyles, Checkbox, FormControlLabel, Box, Button, CircularProgress } from "@material-ui/core";
import { useProviders, useLeaseStatus } from "../../queries";
import { ToggleButtonGroup, ToggleButton, Alert } from "@material-ui/lab";
import * as monaco from "monaco-editor";
import { monacoOptions } from "../../shared/constants";
import { ViewPanel } from "../../shared/components/ViewPanel";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { useThrottledCallback } from "../../hooks/useThrottle";
import { useAsyncTask } from "../../context/AsyncTaskProvider";
import { SelectCheckbox } from "../../shared/components/SelectCheckbox";
import { LeaseSelect } from "./LeaseSelect";
import { MemoMonaco } from "../../shared/components/MemoMonaco";
import { analytics } from "../../shared/utils/analyticsUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiToggleButton-root": {
      color: theme.palette.primary.main,
      fontWeight: "bold",
      "&.Mui-selected": {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main
      }
    }
  }
}));

let socket;

export function DeploymentLogs({ leases, selectedLogsMode, setSelectedLogsMode }) {
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [canSetConnection, setCanSetConnection] = useState(false);
  const [isConnectionEstablished, setIsConnectionEstablished] = useState(false);
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
  const providerInfo = providers?.find((p) => p.owner === selectedLease?.provider);
  const {
    data: leaseStatus,
    refetch: getLeaseStatus,
    isFetching: isLoadingStatus
  } = useLeaseStatus(providerInfo?.host_uri, selectedLease || {}, {
    enabled: false
  });
  const options = {
    ...monacoOptions,
    readOnly: true
  };

  useEffect(() => {
    // Clean up the socket if opened
    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current) {
      const editor = monacoRef.current.editor;

      editor.onDidScrollChange((event) => {
        if (event.scrollTop < event._oldScrollTop) {
          setStickToBottom(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoRef.current]);

  useEffect(() => {
    // Set the services and default selected services
    if (leaseStatus) {
      setServices(Object.keys(leaseStatus.services));
      // Set all services as default
      setSelectedServices(Object.keys(leaseStatus.services));

      setCanSetConnection(true);
    }
  }, [leaseStatus]);

  const updateLogText = useThrottledCallback(
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
    if (!selectedLease || !providerInfo) return;

    getLeaseStatus();
  }, [selectedLease, providerInfo, getLeaseStatus]);

  useEffect(() => {
    if (!canSetConnection || !providerInfo || !isLocalCertMatching || !selectedLease || isConnectionEstablished) return;

    logs.current = [];

    let url = null;
    if (selectedLogsMode === "logs") {
      url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/logs?follow=true&tail=100`;

      if (selectedServices.length < services.length) {
        url += "&service=" + selectedServices.join(",");
      }
    } else {
      url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/kubeevents?follow=true`;
    }

    setIsLoadingLogs(true);

    socket?.close();
    socket = window.electron.openWebSocket(url, localCert.certPem, localCert.keyPem, (message) => {
      setIsLoadingLogs(true);

      if (logs.current.length === 0) {
        setStickToBottom(true);
      }

      let parsedLog = null;
      if (selectedLogsMode === "logs") {
        parsedLog = JSON.parse(message);
        parsedLog.service = parsedLog.name.split("-")[0];
        parsedLog.message = parsedLog.service + ": " + parsedLog.message;
      } else {
        parsedLog = JSON.parse(message);
        parsedLog.service = parsedLog.object.name.split("-")[0];
        parsedLog.message = `${parsedLog.service}: [${parsedLog.type}] [${parsedLog.reason}] [${parsedLog.object.kind}] ${parsedLog.note}`;
      }

      logs.current = logs.current.concat([parsedLog]);

      updateLogText();

      setIsConnectionEstablished(true);
    });
  }, [
    isLocalCertMatching,
    selectedLogsMode,
    selectedLease,
    selectedServices,
    localCert.certPem,
    localCert.keyPem,
    services?.length,
    updateLogText,
    canSetConnection,
    isConnectionEstablished,
    providerInfo
  ]);

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
        setIsConnectionEstablished(false);
      }
    }
  }

  function handleLeaseChange(id) {
    setSelectedLease(leases.find((x) => x.id === id));

    if (id !== selectedLease.id) {
      setLogText("");
      setServices([]);
      setSelectedServices([]);
      setIsLoadingLogs(true);
      setCanSetConnection(false);
      setIsConnectionEstablished(false);
    }
  }

  const onSelectedServicesChange = (selected) => {
    setSelectedServices(selected);

    setLogText("");
    setIsLoadingLogs(true);
    setIsConnectionEstablished(false);
  };

  const onDownloadLogsClick = async () => {
    setIsDownloadingLogs(true);

    await launchAsyncTask(
      async () => {
        const url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/logs?follow=false&tail=10000000`;

        const appPath = await window.electron.appPath("temp");
        const filePath = await window.electron.downloadLogs(
          appPath,
          url,
          localCert.certPem,
          localCert.keyPem,
          `${selectedLease.dseq}_${selectedLease.gseq}_${selectedLease.oseq}`
        );

        const downloadsPath = await window.electron.appPath("downloads");
        const savePath = `${downloadsPath}/${selectedLease.dseq}_${selectedLease.gseq}_${selectedLease.oseq}`;

        await window.electron.saveFileFromTemp(filePath, savePath, { dialogTitle: "Save log file" });
      },
      () => {
        // Cancelled
        window.electron.cancelSaveLogs();
        setIsDownloadingLogs(false);
      },
      "Downloading logs..."
    );

    await analytics.event("deploy", "downloaded logs");

    setIsDownloadingLogs(false);
  };

  return (
    <div className={classes.root}>
      {isLocalCertMatching ? (
        <>
          {selectedLease && (
            <>
              <Box display="flex" alignItems="center" justifyContent="space-between" padding=".2rem .5rem" height="45px">
                <Box display="flex" alignItems="center">
                  <ToggleButtonGroup color="primary" value={selectedLogsMode} exclusive onChange={handleModeChange} size="small">
                    <ToggleButton value="logs" size="small">
                      Logs
                    </ToggleButton>
                    <ToggleButton value="events" size="small">
                      Events
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {leases?.length > 1 && (
                    <Box marginLeft=".5rem">
                      <LeaseSelect leases={leases} defaultValue={selectedLease.id} onSelectedChange={handleLeaseChange} />
                    </Box>
                  )}

                  {services?.length > 0 && canSetConnection && (
                    <Box marginLeft=".5rem">
                      <SelectCheckbox
                        options={services}
                        onSelectedChange={onSelectedServicesChange}
                        label="Services"
                        disabled={selectedLogsMode !== "logs"}
                        defaultValue={selectedServices}
                      />
                    </Box>
                  )}

                  {isLoadingStatus && (
                    <Box marginLeft="1rem">
                      <CircularProgress size="1rem" />
                    </Box>
                  )}
                </Box>

                <Box display="flex" alignItems="center">
                  {localCert && (
                    <Box marginRight="1rem">
                      <Button onClick={onDownloadLogsClick} variant="contained" size="small" color="primary" disabled={isDownloadingLogs}>
                        {isDownloadingLogs ? <CircularProgress size="1.5rem" color="primary" /> : "Download logs"}
                      </Button>
                    </Box>
                  )}
                  <FormControlLabel
                    control={<Checkbox color="primary" checked={stickToBottom} onChange={(ev) => setStickToBottom(ev.target.checked)} size="small" />}
                    label={"Stick to bottom"}
                  />
                </Box>
              </Box>

              <LinearLoadingSkeleton isLoading={isLoadingLogs} />

              <ViewPanel bottomElementId="footer" overflow="hidden">
                <MemoMonaco monacoRef={monacoRef} value={logText} options={options} />
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
