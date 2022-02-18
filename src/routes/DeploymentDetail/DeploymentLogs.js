import { useEffect, useRef, useState } from "react";
import { useCertificate } from "../../context/CertificateProvider";
import { makeStyles, Checkbox, FormControlLabel, FormGroup, Box } from "@material-ui/core";
import { useProviders } from "../../queries";
import MonacoEditor from "react-monaco-editor";
import { ToggleButtonGroup, ToggleButton, Alert } from "@material-ui/lab";
import * as monaco from "monaco-editor";
import { monacoOptions } from "../../shared/constants";
import { ViewPanel } from "../../shared/components/ViewPanel";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";

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

export function DeploymentLogs({ leases }) {
  const [logs, setLogs] = useState([]);
  const [isWaitingForFirstLog, setIsWaitingForFirstLog] = useState(true);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMode, setSelectedMode] = useState("logs");
  const [stickToBottom, setStickToBottom] = useState(true);

  const [selectedLease, setSelectedLease] = useState(null);

  const classes = useStyles();
  const { data: providers } = useProviders();

  const { localCert, isLocalCertMatching } = useCertificate();

  const monacoRef = useRef();

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

    setLogs([]);

    const providerInfo = providers?.find((p) => p.owner === selectedLease.provider);

    let url = null;
    if (selectedMode === "logs") {
      url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/logs?follow=true&tail=100`;

      if (selectedServices.length < services.length) {
        url += "&service=" + selectedServices.join(",");
      }
    } else {
      url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/kubeevents?follow=true`;
    }

    const socket = window.electron.openWebSocket(url, localCert.certPem, localCert.keyPem, (message) => {
      setIsWaitingForFirstLog(false);

      let parsedLog = null;
      if (selectedMode === "logs") {
        parsedLog = JSON.parse(message);
        parsedLog.service = parsedLog.name.split("-")[0];
        parsedLog.message = parsedLog.service + ": " + parsedLog.message;
      } else {
        parsedLog = JSON.parse(message);
        parsedLog.service = parsedLog.object.name.split("-")[0];
        parsedLog.message = `${parsedLog.service}: ${parsedLog.time} [${parsedLog.type}] [${parsedLog.reason}] [${parsedLog.object.kind}] ${parsedLog.note}`;
      }

      setLogs((logs) => [...logs, parsedLog]);
    });

    return () => {
      socket.close();
    };
  }, [leases, providers, isLocalCertMatching, selectedMode, selectedLease, selectedServices, localCert.certPem, localCert.keyPem, services?.length]);

  const logText = logs.map((x) => x.message).join("\n");

  const options = {
    ...monacoOptions,
    readOnly: true
  };

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
      setSelectedMode(val);
    }
  }

  function handleLeaseChange(ev, val) {
    setSelectedLease(leases.find((x) => x.id === val));
  }

  return (
    <div className={classes.root}>
      {isLocalCertMatching ? (
        <>
          {selectedLease && (
            <>
              <Box display="flex" alignItems="center" justifyContent="space-between" padding=".2rem .5rem">
                <div>
                  {leases.length > 1 && (
                    <ToggleButtonGroup className={classes.leaseSelector} color="primary" value={selectedLease.id} exclusive onChange={handleLeaseChange}>
                      {leases.map((l) => (
                        <ToggleButton key={l.id} value={l.id} size="small">
                          GSEQ: {l.gseq}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}

                  <ToggleButtonGroup color="primary" value={selectedMode} exclusive onChange={handleModeChange}>
                    <ToggleButton value="logs" size="small">
                      Logs
                    </ToggleButton>
                    <ToggleButton value="events" size="small">
                      Events
                    </ToggleButton>
                  </ToggleButtonGroup>
                </div>

                <FormControlLabel
                  control={<Checkbox color="primary" checked={stickToBottom} onChange={(ev) => setStickToBottom(ev.target.checked)} />}
                  label={"Stick to bottom"}
                />
              </Box>

              {services.length > 1 && (
                <FormGroup row>
                  {services.map((service) => (
                    <FormControlLabel
                      key={service}
                      disabled={selectedMode !== "logs"}
                      control={
                        <Checkbox color="primary" checked={selectedServices.includes(service)} onChange={(ev) => setServiceCheck(service, ev.target.checked)} />
                      }
                      label={service}
                    />
                  ))}
                </FormGroup>
              )}

              <LinearLoadingSkeleton isLoading={isWaitingForFirstLog} />

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
