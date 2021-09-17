import { useEffect, useRef, useState } from "react";
import { useCertificate } from "../../context/CertificateProvider";
import { Checkbox, FormControlLabel, FormGroup, LinearProgress, Box } from "@material-ui/core";
import { useProviders } from "../../queries";
import MonacoEditor from "react-monaco-editor";
import { ToggleButtonGroup, ToggleButton, Alert } from "@material-ui/lab";

export function DeploymentLogs({ leases }) {
  const [logs, setLogs] = useState([]);
  const [isWaitingForFirstLog, setIsWaitingForFirstLog] = useState(true);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMode, setSelectedMode] = useState("logs");
  const [stickToBottom, setStickToBottom] = useState(true);

  //const [selectedLease, setSelectedLease] = useState(null);

  const { data: providers } = useProviders();

  const { localCert, isLocalCertMatching } = useCertificate();

  const monacoRef = useRef();

  useEffect(() => {
    if (!providers) return;
    if (!isLocalCertMatching) return;

    let sockets = [];
    if (leases && leases.length > 0) {
      (async () => {
        const lease = leases[0];
        const providerInfo = providers?.find((p) => p.owner === lease.provider);

        // TODO: Do only one time?
        const leaseStatusPath = `${providerInfo.host_uri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/status`;
        const leaseStatus = await window.electron.queryProvider(leaseStatusPath, "GET", null, localCert.certPem, localCert.keyPem);

        let url = null;
        if (selectedMode === "logs") {
          setServices(Object.keys(leaseStatus.services));
          setSelectedServices(Object.keys(leaseStatus.services));

          url = `${providerInfo.host_uri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/logs?follow=true`;
        } else {
          url = `${providerInfo.host_uri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/kubeevents?follow=true`;
        }

        const socket = window.electron.openWebSocket(url, localCert.certPem, localCert.keyPem, (message) => {
          setIsWaitingForFirstLog(false);

          let parsedLog = null;
          if (selectedMode === "logs") {
            console.log(message);
            parsedLog = JSON.parse(message);
            parsedLog.service = parsedLog.name.split("-")[0];
          } else {
            console.log(message);
            //parsedLog = {} =
            parsedLog = JSON.parse(message);
            parsedLog.message = parsedLog.event;
          }
          //parsedLog.message = parsedLog.note;
          setLogs((logs) => [...logs, parsedLog]);
        });
        sockets.push(socket);
      })();
    }

    return () => {
      for (let socket of sockets) {
        socket.close();
      }
    };
  }, [leases, providers, isLocalCertMatching, selectedMode]);

  const logText = logs
    .filter((x) => selectedServices.includes(x.service))
    .map((x) => x.message)
    .join("\n");

  const options = {
    selectOnLineNumbers: true,
    scrollBeyondLastLine: false,
    readOnly: true,
    minimap: {
      enabled: false
    }
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
      monacoRef.current.editor.revealLine(monacoRef.current.editor.getModel().getLineCount());
    }
  }, [logText, stickToBottom]);

  function handleModeChange(ev, val) {
    setSelectedMode(val);
  }

  return (
    <>
      {isLocalCertMatching ? (
        <>
          {/* {leases.map(l => (
            <>{JSON.stringify(l)}</>
          ))} */}
          <ToggleButtonGroup color="primary" value={selectedMode} exclusive onChange={handleModeChange}>
            <ToggleButton value="logs">Logs</ToggleButton>
            <ToggleButton value="events">Events</ToggleButton>
          </ToggleButtonGroup>
          <FormGroup row>
            {services.map((service) => (
              <FormControlLabel
                key={service}
                control={
                  <Checkbox color="primary" checked={selectedServices.includes(service)} onChange={(ev) => setServiceCheck(service, ev.target.checked)} />
                }
                label={service}
              />
            ))}
          </FormGroup>
          {isWaitingForFirstLog && <LinearProgress />}
          <MonacoEditor ref={monacoRef} height="600" theme="vs-dark" value={logText} options={options} />
          <FormControlLabel
            control={<Checkbox color="primary" checked={stickToBottom} onChange={(ev) => setStickToBottom(ev.target.checked)} />}
            label={"Stick to bottom"}
          />
        </>
      ) : (
        <Box mt={1}>
          <Alert severity="info">You need a valid certificate to view deployment logs.</Alert>
        </Box>
      )}
    </>
  );
}
