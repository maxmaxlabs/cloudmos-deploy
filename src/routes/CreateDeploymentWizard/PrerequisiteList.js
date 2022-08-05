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
import { useTemplates } from "../../context/TemplatesProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem",
    paddingTop: 0
  },
  list: {
    paddingBottom: "1rem"
  }
}));

export function PrerequisiteList({ selectedTemplate, setSelectedTemplate }) {
  const classes = useStyles();
  const [isLoadingPrerequisites, setIsLoadingPrerequisites] = useState(false);
  const [isBalanceValidated, setIsBalanceValidated] = useState(null);
  const [isCertificateValidated, setIsCertificateValidated] = useState(null);
  const [isLocalCertificateValidated, setIsLocalCertificateValidated] = useState(null);
  const { refreshBalance } = useWallet();
  const { loadValidCertificates, localCert, isLocalCertMatching } = useCertificate();
  const history = useHistory();
  const queryParams = useQueryParams();
  const { getDeploymentData } = useLocalNotes();
  const { getTemplateById } = useTemplates();

  const allCheckSucceeded = isCertificateValidated && isLocalCertificateValidated;

  useEffect(() => {
    const redeployTemplate = getRedeployTemplate();
    const galleryTemplate = getGalleryTemplate();

    if (redeployTemplate) {
      // If it's a redeploy, set the template from local storage
      setSelectedTemplate(redeployTemplate);
    } else if (galleryTemplate) {
      // If it's a deploy from the template gallery, load from template data
      setSelectedTemplate(galleryTemplate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadPrerequisites() {
      setIsLoadingPrerequisites(true);

      const balance = await refreshBalance();
      const validCertificates = await loadValidCertificates();
      const currentCert = validCertificates.find((x) => x.parsed === localCert?.certPem);
      const isBalanceValidated = balance >= 5000000;
      const isCertificateValidated = currentCert?.certificate?.state === "valid";
      const isLocalCertificateValidated = !!localCert && isLocalCertMatching;

      setIsBalanceValidated(isBalanceValidated);
      setIsCertificateValidated(isCertificateValidated);
      setIsLocalCertificateValidated(isLocalCertificateValidated);

      setIsLoadingPrerequisites(false);

      // Auto redirect when all is good
      const redeployTemplate = getRedeployTemplate();
      const galleryTemplate = getGalleryTemplate();
      if (isBalanceValidated && isCertificateValidated && isLocalCertificateValidated) {
        if (redeployTemplate || galleryTemplate) {
          history.replace(UrlService.createDeploymentStepManifest());
        } else {
          history.replace(UrlService.createDeploymentStepTemplate());
        }
      }
    }

    loadPrerequisites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshBalance, loadValidCertificates, localCert, isLocalCertMatching]);

  const getRedeployTemplate = () => {
    let template = null;
    if (queryParams.get("redeploy")) {
      const deploymentData = getDeploymentData(queryParams.get("redeploy"));

      if (deploymentData && deploymentData.manifest) {
        template = {
          name: deploymentData.name,
          code: "empty",
          content: deploymentData.manifest
        };
      }
    }

    return template;
  };

  const getGalleryTemplate = () => {
    let template = null;
    if (queryParams.get("templateId")) {
      const templateById = getTemplateById(queryParams.get("templateId"));
      if (templateById) {
        template = {
          code: "empty",
          content: templateById.deploy,
          valuesToChange: templateById.valuesToChange || []
        };
      }
    }

    return template;
  };

  function handleNextClick() {
    if (selectedTemplate) {
      history.replace(UrlService.createDeploymentStepManifest());
    } else {
      history.replace(UrlService.createDeploymentStepTemplate());
    }
  }

  return (
    <div className={classes.root}>
      <Helmet title="Create Deployment - Prerequisites" />

      <List className={classes.list}>
        <ListItem>
          <ListItemIcon>
            {isBalanceValidated === null && <CircularProgress />}
            {isBalanceValidated === true && <CheckCircleOutlineIcon fontSize="large" style={{ color: green[500] }} />}
            {isBalanceValidated === false && <ErrorOutlineIcon fontSize="large" color="secondary" />}
          </ListItemIcon>
          <ListItemText
            primary="Wallet Balance"
            secondary="The balance of the wallet needs to be of at least 5 AKT. If you do not have 5 AKT, you will need to specify an authorized depositor."
          />
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
        {isLoadingPrerequisites ? <CircularProgress size="1.5rem" color="primary" /> : "Continue"}
      </Button>
    </div>
  );
}
