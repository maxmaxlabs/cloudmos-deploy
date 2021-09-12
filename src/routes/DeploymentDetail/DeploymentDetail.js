import { useState, useEffect, useCallback, createRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { CircularProgress, Tabs, Tab, IconButton, Card, CardContent, CardHeader, Typography, Box } from "@material-ui/core";
import { LeaseRow } from "./LeaseRow";
import { useStyles } from "./DeploymentDetail.styles";
import { DeploymentSubHeader } from "./DeploymentSubHeader";
import { useWallet } from "../../context/WalletProvider";
import { DeploymentJsonViewer } from "./DeploymentJsonViewer";
import { ManifestEditor } from "./ManifestEditor";
import { useBlock, useDeploymentDetail, useLeaseList } from "../../queries";
import RefreshIcon from "@material-ui/icons/Refresh";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { Helmet } from "react-helmet-async";
import { useLocalNotes } from "../../context/LocalNoteProvider";

export function DeploymentDetail(props) {
  const [deployment, setDeployment] = useState(null);
  const [activeTab, setActiveTab] = useState("DETAILS");
  const classes = useStyles();
  const history = useHistory();
  const { address } = useWallet();
  const { getDeploymentName } = useLocalNotes();
  const { dseq } = useParams();
  const {
    data: deploymentDetail,
    isFetching: isLoadingDeployment,
    refetch: getDeploymentDetail
  } = useDeploymentDetail(address, dseq, { refetchOnMount: false, enabled: false });
  const { data: leases, isLoading: isLoadingLeases, refetch: getLeases, remove: removeLeases } = useLeaseList(deployment, address, { enabled: !!deployment });
  const { data: currentBlock, refetch: getCurrentBlock } = useBlock(deployment?.createdAt, { enabled: !!deployment });
  const hasLeases = leases && leases.length > 0;
  const [leaseRefs, setLeaseRefs] = useState([]);

  const deploymentName = getDeploymentName(dseq);

  const loadLeases = useCallback(async () => {
    getLeases();

    // Redirect to select bids if has no lease
    if (deployment.state === "active" && !hasLeases && !isLoadingLeases) {
      history.push("/createDeployment/acceptBids/" + dseq);
    }

    // Set the array of refs for lease rows
    // To be able to refresh lease status when refresh deployment detail
    if (hasLeases && leases.length !== leaseRefs) {
      setLeaseRefs((elRefs) =>
        Array(leases.length)
          .fill()
          .map((_, i) => elRefs[i] || createRef())
      );
    }
  }, [deployment, hasLeases, isLoadingLeases, leases, dseq]);

  useEffect(() => {
    if (deployment) {
      loadLeases();
      getCurrentBlock();
    }
  }, [deployment, loadLeases]);

  useEffect(() => {
    if (deploymentDetail) {
      setDeployment(deploymentDetail);
    }
  }, [deploymentDetail]);

  useEffect(() => {
    let deploymentFromList = props.deployments?.find((d) => d.dseq === dseq);
    if (deploymentFromList) {
      setDeployment(deploymentFromList);
    } else {
      loadDeploymentDetail();
    }
  }, []);

  function loadDeploymentDetail() {
    if (!isLoadingDeployment) {
      getDeploymentDetail();
      getLeases();

      leaseRefs.forEach((lr) => lr.current.getLeaseStatus());
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
              <IconButton aria-label="back" onClick={() => loadDeploymentDetail()}>
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
              removeLeases={removeLeases}
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
            {leases && leases.map((lease, i) => <LeaseRow key={lease.id} lease={lease} setActiveTab={setActiveTab} ref={leaseRefs[i]} />)}
            {!hasLeases && !isLoadingLeases && !isLoadingDeployment && <>This deployment doesn't have any leases</>}

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
