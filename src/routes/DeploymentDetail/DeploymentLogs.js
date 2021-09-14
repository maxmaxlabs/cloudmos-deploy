import { useEffect, useRef, useState } from "react";
import { useCertificate } from "../../context/CertificateProvider";
import { Checkbox, FormControlLabel, FormGroup, LinearProgress, Box } from "@material-ui/core";
import { useProviders } from "../../queries";
import MonacoEditor from "react-monaco-editor";
import Alert from "@material-ui/lab/Alert";

export function DeploymentLogs({ leases }) {
  const [logs, setLogs] = useState([]);
  const [isWaitingForFirstLog, setIsWaitingForFirstLog] = useState(true);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [stickToBottom, setStickToBottom] = useState(true);

  const { data: providers } = useProviders();

  const { localCert, isLocalCertMatching } = useCertificate();

  const monacoRef = useRef();

  useEffect(() => {
    if (!providers) return;
    if (!isLocalCertMatching) return;

    let sockets = [];
    if (leases && leases.length > 0) {
      (async () => {
        for (let lease of leases) {
          const providerInfo = providers?.find((p) => p.owner === lease.provider);

          const leaseStatusPath = `${providerInfo.host_uri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/status`;
          const leaseStatus = await window.electron.queryProvider(leaseStatusPath, "GET", null, localCert.certPem, localCert.keyPem);
          setServices(Object.keys(leaseStatus.services));
          setSelectedServices(Object.keys(leaseStatus.services));

          const url = `${providerInfo.host_uri}/lease/${lease.dseq}/${lease.gseq}/${lease.oseq}/logs?follow=true`;
          const socket = window.electron.openWebSocket(url, localCert.certPem, localCert.keyPem, (message) => {
            setIsWaitingForFirstLog(false);

            let parsedLog = JSON.parse(message);
            parsedLog.service = parsedLog.name.split("-")[0];
            setLogs((logs) => [...logs, parsedLog]);
            console.log(message);
          });
          sockets.push(socket);
        }
      })();
    }

    return () => {
      for (let socket of sockets) {
        socket.close();
      }
    };
  }, [leases, providers, isLocalCertMatching]);

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
    if (stickToBottom) {
      monacoRef.current.editor.revealLine(monacoRef.current.editor.getModel().getLineCount());
    }
  }, [logText, stickToBottom]);

  return (
    <>
      {isLocalCertMatching ? (
        <>
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
