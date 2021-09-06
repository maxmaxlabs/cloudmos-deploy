import { useState, useEffect, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { CircularProgress, Tabs, Tab, IconButton, Card, CardContent, CardHeader, Typography, Box } from "@material-ui/core";
import { LeaseRow } from "./LeaseRow";
import { useStyles } from "./DeploymentDetail.styles";
import { DeploymentSubHeader } from "./DeploymentSubHeader";
import { useWallet } from "../../context/WalletProvider";
import { deploymentToDto } from "../../shared/utils/deploymentDetailUtils";
import { DeploymentJsonViewer } from "./DeploymentJsonViewer";
import { ManifestEditor } from "./ManifestEditor";
import { useLeaseList } from "../../queries";
import { useSettings } from "../../context/SettingsProvider";
import RefreshIcon from "@material-ui/icons/Refresh";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { Helmet } from "react-helmet-async";
import { useLocalNotes } from "../../context/LocalNoteProvider";

export function DeploymentDetail(props) {
  const { settings } = useSettings();
  // const [isLoadingLeases, setIsLoadingLeases] = useState(false);
  // const [leases, setLeases] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [isLoadingDeployment, setIsLoadingDeployment] = useState(false);
  const [activeTab, setActiveTab] = useState("DETAILS");
  const classes = useStyles();
  const history = useHistory();
  const { address } = useWallet();
  const { getDeploymentName } = useLocalNotes();
  const { dseq } = useParams();
  const { data: leases, isLoading: isLoadingLeases, refetch: getLeases } = useLeaseList(deployment, address, { enabled: !!deployment });
  const hasLeases = leases && leases.length > 0;

  const deploymentName = getDeploymentName(dseq);

  const loadLeases = useCallback(async () => {
    getLeases();

    if (deployment.state === "active" && !hasLeases && !isLoadingLeases) {
      history.push("/createDeployment/acceptBids/" + dseq);
    }
  }, [deployment, leases]);

  const loadBlock = useCallback(async () => {
    // setIsLoadingLeases(true);
    const response = await fetch(`${settings.apiEndpoint}/blocks/${deployment.createdAt}`);
    const data = await response.json();

    setCurrentBlock(data);

    // setIsLoadingLeases(false);
  }, [deployment, settings.apiEndpoint]);

  useEffect(() => {
    if (deployment) {
      loadLeases();
      loadBlock();
    }
  }, [deployment, loadLeases, loadBlock]);

  useEffect(() => {
    (async function () {
      let deploymentFromList = props.deployments?.find((d) => d.dseq === dseq);
      if (deploymentFromList) {
        setDeployment(deploymentFromList);
      } else {
        await loadDeploymentDetail();
      }
    })();
  }, []);

  async function loadDeploymentDetail() {
    if (!isLoadingDeployment) {
      setIsLoadingDeployment(true);
      const response = await fetch(settings.apiEndpoint + "/akash/deployment/v1beta1/deployments/info?id.owner=" + address + "&id.dseq=" + dseq);
      const deployment = await response.json();

      setDeployment(deploymentToDto(deployment));
      setIsLoadingDeployment(false);
    }
  }

  function handleBackClick() {
    history.goBack();
  }

  return (
    <Card variant="outlined" className={classes.root}>
      <Helmet title="Deployment Detail" />

      <LinearLoadingSkeleton isLoading={isLoadingLeases || isLoadingDeployment} />
      <CardHeader
        classes={{
          title: classes.cardTitle
        }}
        title={
          <Box display="flex" alignItems="center">
            <IconButton aria-label="back" onClick={handleBackClick}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h3" className={classes.title}>
              Deployment detail
              {deploymentName && <> - {deploymentName}</>}
            </Typography>
            <Box marginLeft="1rem">
              <IconButton aria-label="back" onClick={loadDeploymentDetail}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        }
        subheader={
          deployment && (
            <DeploymentSubHeader
              deployment={deployment}
              block={currentBlock}
              deploymentCost={hasLeases ? leases.reduce((prev, current) => prev + current.price.amount, []) : 0}
              address={address}
              loadDeploymentDetail={loadDeploymentDetail}
            />
          )
        }
      />

      <Tabs value={activeTab} onChange={(ev, value) => setActiveTab(value)} indicatorColor="primary" textColor="primary">
        <Tab value="DETAILS" label="Details" />
        <Tab value="EDIT" label="View / Edit Manifest" />
        {/* <Tab label="Logs" /> */}
        <Tab value="JSON_DEPLOYMENT" label="Deployment JSON" />
        <Tab value="JSON_LEASES" label="Leases JSON" />
      </Tabs>

      <CardContent>
        {activeTab === "EDIT" && deployment && leases && (
          <ManifestEditor deployment={deployment} leases={leases} closeManifestEditor={() => setActiveTab("DETAILS")} />
        )}
        {activeTab === "JSON_DEPLOYMENT" && deployment && <DeploymentJsonViewer jsonObj={deployment} title="Deployment JSON" />}
        {activeTab === "JSON_LEASES" && deployment && <DeploymentJsonViewer jsonObj={leases} title="Leases JSON" />}
        {activeTab === "DETAILS" && (
          <>
            <Typography variant="h6" gutterBottom className={classes.title}>
              Leases
            </Typography>
            {leases && leases.map((lease) => <LeaseRow key={lease.id} cert={props.cert} lease={lease} deployment={deployment} setActiveTab={setActiveTab} />)}
            {!hasLeases && !isLoadingLeases && <>This deployment doesn't have any leases</>}

            {(isLoadingLeases || isLoadingDeployment) && !hasLeases && (
              <Box textAlign="center" padding="2rem">
                <CircularProgress />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
