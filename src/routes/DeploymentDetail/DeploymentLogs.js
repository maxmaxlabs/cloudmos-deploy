import { useEffect, useState } from "react";
import { useCertificate } from "../../context/CertificateProvider";
import MonacoEditor from "react-monaco-editor";
import { Checkbox, FormControlLabel, FormGroup, LinearProgress } from "@material-ui/core";
import { useSettings } from "../../context/SettingsProvider";
import { fetchProviderInfo } from "../../shared/providerCache";

export function DeploymentLogs({ leases }) {
  const [logs, setLogs] = useState([]);
  const [isWaitingForFirstLog, setIsWaitingForFirstLog] = useState(true);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const { localCert } = useCertificate();
  const { settings } = useSettings();

  useEffect(() => {
    let sockets = [];
    if (leases && leases.length > 0) {
      (async () => {
        for (let lease of leases) {
          const providerInfo = await fetchProviderInfo(settings.apiEndpoint, lease.provider);

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
  }, [leases]);

  const logText = logs.filter(x => selectedServices.includes(x.service)).map((x) => x.message).join("\n");

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

  return (
    <>
      <FormGroup row>
        {services.map((service) => (
          <FormControlLabel
            control={<Checkbox color="primary" checked={selectedServices.includes(service)} onChange={(ev) => setServiceCheck(service, ev.target.checked)} />}
            label={service}
          />
        ))}
      </FormGroup>
      {isWaitingForFirstLog && <LinearProgress />}
      <MonacoEditor height="600" theme="vs-dark" value={logText} options={options} />
    </>
  );
}
