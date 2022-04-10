import React, { useEffect, useRef, useState } from "react";
import { useCertificate } from "../../context/CertificateProvider";
import { makeStyles, CircularProgress, Checkbox, FormControlLabel, FormGroup, Box, TextField, FormControl, InputAdornment, Button } from "@material-ui/core";
import { useProviders } from "../../queries";
import MonacoEditor from "react-monaco-editor";
import { ToggleButtonGroup, ToggleButton, Alert } from "@material-ui/lab";
import * as monaco from "monaco-editor";
import { monacoOptions } from "../../shared/constants";
import { ViewPanel } from "../../shared/components/ViewPanel";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { useThrottledCallback } from "../../hooks/useThrottle";
import { useLeaseStatus } from "../../queries/useLeaseQuery";
import { useForm, Controller } from "react-hook-form";
import isEqual from "lodash/isEqual";
import { ShellDownloadModal } from "./ShellDownloadModal";
import { LeaseSelect } from "./LeaseSelect";

// TODO Colors theme
const vsDark = "#1e1e1e";
const vsDarkFont = "#d4d4d4";

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
  },
  commandForm: {
    backgroundColor: vsDark,
    borderTop: `1px solid ${theme.palette.grey[800]}`
  },
  commandInputRoot: {
    "& fieldset": {
      border: "none",
      backgroundColor: vsDark
    }
  },
  commandInputBase: {
    borderRadius: 0,
    padding: 0
  },
  commandInput: {
    color: vsDarkFont,
    zIndex: 100
  },
  clearButtonContainer: {
    zIndex: 100
  },
  clearButton: {
    borderRadius: 0,
    height: "39px"
  }
}));

const _monacoOptions = {
  ...monacoOptions,
  inlineSuggest: {
    enable: false
  },
  quickSuggestions: false,
  acceptSuggestionOnEnter: "off",
  acceptSuggestionOnCommitCharacter: false,
  snippetSuggestions: "none",
  suggestOnTriggerCharacters: false,
  suggest: false,
  codeLens: false,
  readOnly: true,
  lineNumbers: false,
  colorDecorators: false
};

export function DeploymentLeaseShell({ leases }) {
  const classes = useStyles();
  const [canSetConnection, setCanSetConnection] = useState(false);
  const [isConnectionEstablished, setIsConnectionEstablished] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const formRef = useRef();
  const logs = useRef([]);
  const monacoRef = useRef();
  const commandRef = useRef();
  const [logText, setLogText] = useState("");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedLease, setSelectedLease] = useState(null);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const [isShowingDownloadModal, setIsShowingDownloadModal] = useState(false);
  const { data: providers } = useProviders();
  const { localCert, isLocalCertMatching } = useCertificate();
  const providerInfo = providers?.find((p) => p.owner === selectedLease?.provider);
  const { refetch: getLeaseStatus } = useLeaseStatus(providerInfo?.host_uri, selectedLease || {}, {
    enabled: false,
    onSuccess: (leaseStatus) => {
      if (leaseStatus) {
        setServices(Object.keys(leaseStatus.services));
        // TODO only one service at a time
        setSelectedServices(Object.keys(leaseStatus.services));

        setCanSetConnection(true);
      }
    }
  });
  const { handleSubmit, control, setValue } = useForm({
    defaultValues: {
      command: ""
    }
  });

  const updateLogText = useThrottledCallback(
    () => {
      const logText = logs.current.map((x) => x).join("\n");
      setLogText(logText);
      setIsLoadingData(false);

      const editor = monacoRef.current.editor;
      // Immediate scroll type, scroll to bottom
      editor.revealLine(editor.getModel().getLineCount(), 1);
      // Clear selection
      editor.setSelection(new monaco.Selection(0, 0, 0, 0));

      commandRef.current.focus();
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

    getLeaseStatus();
  }, [selectedLease, providers, getLeaseStatus]);

  useEffect(() => {
    if (!canSetConnection || !providers || !isLocalCertMatching || !selectedLease || !selectedServices || !selectedServices.length || isConnectionEstablished)
      return;

    logs.current = [];
    console.log("Connection with service = ", selectedServices[0]);
    const url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/shell?stdin=0&tty=0&podIndex=0&cmd0=ls&service=${selectedServices[0]}`;
    setIsLoadingData(true);

    const socket = window.electron.openWebSocket(url, localCert.certPem, localCert.keyPem, (message) => {
      let parsedData = Buffer.from(message.data).toString("utf-8", 1);
      let jsonData, exitCode, errorMessage;
      try {
        jsonData = JSON.parse(parsedData);
        exitCode = jsonData["exit_code"];
        errorMessage = jsonData["message"];
      } catch (error) {}

      if (exitCode !== undefined) {
        if (errorMessage) {
          parsedData = `An error has occured: ${errorMessage}`;
        } else {
          parsedData = "// Connection established! ☁ 🚀 🌙\n// Type a command below like 'ls':";
        }

        logs.current = logs.current.concat([parsedData]);

        updateLogText();

        setIsLoadingData(false);
        setIsConnectionEstablished(true);
      }
    });

    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leases, providers, isLocalCertMatching, selectedLease, selectedServices, localCert.certPem, localCert.keyPem, services?.length, isConnectionEstablished]);

  function setServiceCheck(service, isChecked) {
    if (isChecked) {
      setSelectedServices([...selectedServices, service]);
    } else {
      setSelectedServices((selectedServices) => selectedServices.filter((x) => x !== service));
    }
  }

  // On command submit
  const onSubmit = async ({ command }) => {
    if (!isConnectionEstablished || isLoadingData) return;

    const url = `${providerInfo.host_uri}/lease/${selectedLease.dseq}/${selectedLease.gseq}/${selectedLease.oseq}/shell?stdin=0&tty=0&podIndex=0${command
      .split(" ")
      .map((c, i) => `&cmd${i}=${encodeURIComponent(c.replace(" ", "+"))}`)
      .join("")}${`&service=${selectedServices[0]}`}`;

    logs.current = logs.current.concat([`\n// command: ${command}\n// ---------------------------`]);
    updateLogText();
    // Clear current command
    setValue("command", "");

    setIsLoadingData(true);
    const socket = window.electron.openWebSocket(url, localCert.certPem, localCert.keyPem, (message) => {
      let parsedData = Buffer.from(message.data)
        .toString("utf-8", 1)
        .replace(/^\n|\n$/g, "");

      let jsonData, exitCode, errorMessage;
      try {
        jsonData = JSON.parse(parsedData);
        exitCode = jsonData["exit_code"];
        errorMessage = jsonData["message"];
      } catch (error) {}

      if (exitCode !== undefined) {
        if (errorMessage) {
          parsedData = `An error has occured: ${errorMessage}`;
        } else {
          parsedData = "";
        }

        setIsLoadingData(false);

        socket.close();
      }

      if (parsedData) {
        logs.current = logs.current.concat([parsedData]);
        updateLogText();
      }
    });
  };

  function handleLeaseChange(id) {
    setSelectedLease(leases.find((x) => x.id === id));

    if (id !== selectedLease.id) {
      setLogText("");
      setCanSetConnection(false);
      setIsConnectionEstablished(false);
    }
  }

  const onClearShell = () => {
    logs.current = [];
    updateLogText();
  };

  const onDownloadFileClick = async () => {
    setIsShowingDownloadModal(true);
  };

  const onCloseDownloadClick = () => {
    // setIsDownloadingFile(false);
    setIsShowingDownloadModal(false);
  };

  return (
    <div className={classes.root}>
      {isShowingDownloadModal && (
        <ShellDownloadModal
          onCloseClick={onCloseDownloadClick}
          selectedLease={selectedLease}
          localCert={localCert}
          providerInfo={providerInfo}
          selectedServices={selectedServices}
          isDownloadingFile={isDownloadingFile}
          setIsDownloadingFile={setIsDownloadingFile}
        />
      )}

      {isLocalCertMatching ? (
        <>
          {selectedLease && (
            <>
              <Box display="flex" alignItems="center" justifyContent="space-between" padding=".2rem .5rem">
                <Box display="flex" alignItems="center">
                  {leases?.length > 1 && (
                    <div>
                      <LeaseSelect leases={leases} defaultValue={selectedLease.id} onSelectedChange={handleLeaseChange} />
                    </div>
                  )}

                  {/** TODO Set service radio button */}
                  {services?.length > 1 && (
                    <FormGroup row>
                      {services.map((service) => (
                        <FormControlLabel
                          key={service}
                          control={
                            <Checkbox
                              color="primary"
                              checked={selectedServices.includes(service)}
                              onChange={(ev) => setServiceCheck(service, ev.target.checked)}
                            />
                          }
                          label={service}
                        />
                      ))}
                    </FormGroup>
                  )}
                </Box>

                <Box display="flex" alignItems="center">
                  {localCert && (
                    <div>
                      <Button
                        onClick={onDownloadFileClick}
                        variant="contained"
                        size="small"
                        color="primary"
                        disabled={isDownloadingFile || !isConnectionEstablished}
                      >
                        {isDownloadingFile ? <CircularProgress size="1.5rem" color="primary" /> : "Download file"}
                      </Button>
                    </div>
                  )}
                </Box>
              </Box>

              <LinearLoadingSkeleton isLoading={isLoadingData} />

              <ViewPanel bottomElementId="footer" overflow="hidden" offset={39}>
                <MemoMonaco logText={logText} monacoRef={monacoRef} />
              </ViewPanel>

              <div id="terminal-command">
                <form onSubmit={handleSubmit(onSubmit)} ref={formRef} className={classes.commandForm}>
                  <FormControl className={classes.commandInputRoot} fullWidth>
                    <Controller
                      control={control}
                      name="command"
                      render={({ field }) => {
                        return (
                          <TextField
                            {...field}
                            type="text"
                            variant="outlined"
                            autoFocus
                            placeholder="Type command"
                            fullWidth
                            InputProps={{
                              ref: commandRef,
                              classes: { input: classes.commandInput, root: classes.commandInputBase },
                              endAdornment: (
                                <InputAdornment position="end" className={classes.clearButtonContainer}>
                                  <Button
                                    size="small"
                                    onClick={() => onClearShell()}
                                    variant="contained"
                                    className={classes.clearButton}
                                    disabled={isLoadingData || !isConnectionEstablished}
                                  >
                                    Clear
                                  </Button>
                                </InputAdornment>
                              )
                            }}
                          />
                        );
                      }}
                    />
                  </FormControl>
                </form>
              </div>
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

const MemoMonaco = React.memo(
  function MemoMonaco({ logText, monacoRef }) {
    return <MonacoEditor ref={monacoRef} theme="vs-dark" value={logText} options={_monacoOptions} />;
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  }
);
