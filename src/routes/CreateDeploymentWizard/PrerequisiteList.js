import React, { useEffect, useState } from "react";
import { makeStyles, Button, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { useCertificate } from "../../context/CertificateProvider";
import { useWallet } from "../../context/WalletProvider";
import { useQueryParams } from "../../hooks/useQueryParams";
import { useHistory } from "react-router";
import { Helmet } from "react-helmet-async";
import { UrlService } from "../../shared/utils/urlUtils";
import { useLocalNotes } from "../../context/LocalNoteProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  }
}));

export function PrerequisiteList({ selectedTemplate, setSelectedTemplate }) {
  const [isBalanceValidated, setIsBalanceValidated] = useState(null);
  const [isCertificateValidated, setIsCertificateValidated] = useState(null);
  const [isLocalCertificateValidated, setIsLocalCertificateValidated] = useState(null);
  const { refreshBalance } = useWallet();
  const { loadValidCertificates, localCert, isLocalCertMatching } = useCertificate();
  const history = useHistory();
  const queryParams = useQueryParams();
  const { getDeploymentData } = useLocalNotes();

  useEffect(() => {
    // If it's a redeploy, set the template from local storage
    if (queryParams.get("redeploy")) {
      const deploymentData = getDeploymentData(queryParams.get("redeploy"));

      if (deploymentData && deploymentData.manifest) {
        const template = {
          code: "empty",
          content: deploymentData.manifest
        };
        setSelectedTemplate(template);
      }
    }
  }, []);

  useEffect(() => {
    async function loadPrerequisites() {
      const balance = await refreshBalance();
      setIsBalanceValidated(balance >= 5000000);

      const certificate = await loadValidCertificates();
      setIsCertificateValidated(certificate?.certificate?.state === "valid");

      setIsLocalCertificateValidated(!!localCert && isLocalCertMatching);
    }

    loadPrerequisites();
  }, [refreshBalance, loadValidCertificates, localCert, isLocalCertMatching]);

  const classes = useStyles();

  function handleNextClick() {
    if (selectedTemplate) {
      history.push(UrlService.createDeploymentStepManifest());
    } else {
      history.push(UrlService.createDeploymentStepTemplate());
    }
  }

  const allCheckSucceeded = isBalanceValidated && isCertificateValidated && isLocalCertificateValidated;

  return (
    <>
      <Helmet title="Create Deployment - Prerequisites" />

      <List className={classes.root}>
        <ListItem>
          <ListItemIcon>
            {isBalanceValidated === null && <CircularProgress />}
            {isBalanceValidated === true && <CheckCircleOutlineIcon fontSize="large" style={{ color: green[500] }} />}
            {isBalanceValidated === false && <ErrorOutlineIcon fontSize="large" color="secondary" />}
          </ListItemIcon>
          <ListItemText primary="Wallet Balance" secondary="The balance of the wallet needs to be of at least 5 AKT" />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            {isCertificateValidated === null && <CircularProgress />}
            {isCertificateValidated === true && <CheckCircleOutlineIcon fontSize="large" style={{ color: green[500] }} />}
            {isCertificateValidated === false && <ErrorOutlineIcon fontSize="large" color="secondary" />}
          </ListItemIcon>
          <ListItemText primary="Valid certificate on the blockchain" secondary="A valid certificate must be present on the blockchain" />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            {isLocalCertificateValidated === null && <CircularProgress />}
            {isLocalCertificateValidated === true && <CheckCircleOutlineIcon fontSize="large" style={{ color: green[500] }} />}
            {isLocalCertificateValidated === false && <ErrorOutlineIcon fontSize="large" color="secondary" />}
          </ListItemIcon>
          <ListItemText
            primary="Valid local certificate"
            secondary={
              <>
                A local certificate must match the on-chain certificate.
                <br />
                {isCertificateValidated &&
                  isLocalCertificateValidated === false &&
                  "If you have a valid certificate on the blockchain but not a valid local certificate, you need to revoke your blockchain certificate and create a new one with the tool."}
              </>
            }
          />
        </ListItem>
      </List>

      <Button variant="contained" color="primary" disabled={!allCheckSucceeded} onClick={handleNextClick}>
        Continue
      </Button>
    </>
  );
}
