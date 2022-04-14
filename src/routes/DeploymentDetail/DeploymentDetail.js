import { useState, useEffect, useCallback, createRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { CircularProgress, Tabs, Tab, Box } from "@material-ui/core";
import { LeaseRow } from "./LeaseRow";
import { useStyles } from "./DeploymentDetail.styles";
import { DeploymentSubHeader } from "./DeploymentSubHeader";
import { useWallet } from "../../context/WalletProvider";
import { DeploymentJsonViewer } from "./DeploymentJsonViewer";
import { ManifestEditor } from "./ManifestEditor";
import { useDeploymentDetail, useLeaseList } from "../../queries";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { Helmet } from "react-helmet-async";
import { DeploymentLogs } from "./DeploymentLogs";
import { useCertificate } from "../../context/CertificateProvider";
import Alert from "@material-ui/lab/Alert";
import { getDeploymentLocalData } from "../../shared/utils/deploymentLocalDataUtils";
import { DeploymentDetailTopBar } from "./DeploymentDetailTopBar";
import { DeploymentLeaseShell } from "./DeploymentLeaseShell";
import { analytics } from "../../shared/utils/analyticsUtils";
import { useQueryParams } from "../../hooks/useQueryParams";

export function DeploymentDetail({ deployments }) {
  const [deployment, setDeployment] = useState(null);
  const queryParams = useQueryParams();
  const { dseq } = useParams();
  const [activeTab, setActiveTab] = useState("LEASES");
  const [selectedLogsMode, setSelectedLogsMode] = useState("logs");
  const classes = useStyles();
  const history = useHistory();
  const { address } = useWallet();
  const {
    data: deploymentDetail,
    isFetching: isLoadingDeployment,
    refetch: getDeploymentDetail
  } = useDeploymentDetail(address, dseq, { refetchOnMount: false, enabled: false });
  const { data: leases, isLoading: isLoadingLeases, refetch: getLeases, remove: removeLeases } = useLeaseList(deployment, address, { enabled: !!deployment });
  const hasLeases = leases && leases.length > 0;
  const [leaseRefs, setLeaseRefs] = useState([]);
  const { isLocalCertMatching, localCert } = useCertificate();
  const [deploymentManifest, setDeploymentManifest] = useState(null);

  useEffect(() => {
    if (leases && leases.some((l) => l.state === "active")) {
      const tabQuery = queryParams.get("tab");
      const logsModeQuery = queryParams.get("logsMode");

      if (tabQuery) {
        setActiveTab(tabQuery);
      }

      if (logsModeQuery) {
        setSelectedLogsMode(logsModeQuery);
      }
    }
  }, [queryParams, leases]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployment, hasLeases, isLoadingLeases, leases, dseq]);

  useEffect(() => {
    if (deployment) {
      loadLeases();

      const deploymentData = getDeploymentLocalData(dseq);
      setDeploymentManifest(deploymentData?.manifest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployment, loadLeases]);

  useEffect(() => {
    if (deploymentDetail) {
      setDeployment(deploymentDetail);
    }
  }, [deploymentDetail]);

  useEffect(() => {
    let deploymentFromList = deployments?.find((d) => d.dseq === dseq);
    if (deploymentFromList) {
      setDeployment(deploymentFromList);
    } else {
      loadDeploymentDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadDeploymentDetail() {
    if (!isLoadingDeployment) {
      getDeploymentDetail();
      getLeases();

      leaseRefs.forEach((lr) => lr.current?.getLeaseStatus());
    }
  }

  const onChangeTab = async (ev, value) => {
    setActiveTab(value);

    await analytics.event("deploy", `navigate tab ${value}`);
  };

  return (
    <div className={classes.root}>
      <Helmet title="Deployment Detail" />

      <LinearLoadingSkeleton isLoading={isLoadingLeases || isLoadingDeployment} />

      <DeploymentDetailTopBar
        address={address}
        loadDeploymentDetail={loadDeploymentDetail}
        removeLeases={removeLeases}
        setActiveTab={setActiveTab}
        deployment={deployment}
      />

      {deployment && (
        <DeploymentSubHeader deployment={deployment} deploymentCost={hasLeases ? leases.reduce((prev, current) => prev + current.price.amount, 0) : 0} />
      )}

      <Tabs value={activeTab} onChange={onChangeTab} indicatorColor="primary" textColor="primary" classes={{ root: classes.tabsRoot }}>
        <Tab value="LEASES" label="Leases" classes={{ selected: classes.selectedTab }} />
        {deployment?.state === "active" && leases?.some((x) => x.state === "active") && (
          <Tab value="LOGS" label="Logs" classes={{ selected: classes.selectedTab }} />
        )}
        {deployment?.state === "active" && leases?.some((x) => x.state === "active") && (
          <Tab value="SHELL" label="Shell" classes={{ selected: classes.selectedTab }} />
        )}
        <Tab value="EDIT" label="View / Edit Manifest" classes={{ selected: classes.selectedTab }} />
        <Tab value="RAW_DATA" label="Raw Data" classes={{ selected: classes.selectedTab }} />
      </Tabs>

      {activeTab === "EDIT" && deployment && leases && (
        <ManifestEditor
          deployment={deployment}
          leases={leases}
          closeManifestEditor={() => {
            setActiveTab("LOGS");
            setSelectedLogsMode("events");
          }}
        />
      )}
      {activeTab === "LOGS" && <DeploymentLogs leases={leases} selectedLogsMode={selectedLogsMode} setSelectedLogsMode={setSelectedLogsMode} />}
      {activeTab === "SHELL" && <DeploymentLeaseShell leases={leases} />}
      {activeTab === "RAW_DATA" && deployment && (
        <Box display="flex">
          <DeploymentJsonViewer jsonObj={deployment} title="Deployment JSON" />
          <DeploymentJsonViewer jsonObj={leases} title="Leases JSON" />
        </Box>
      )}
      {activeTab === "LEASES" && (
        <Box padding="1rem">
          {leases && (!localCert || !isLocalCertMatching) && (
            <Box marginBottom="1rem">
              <Alert severity="warning">You do not have a valid local certificate. You need to create a new one to view lease status and details.</Alert>
            </Box>
          )}

          {leases &&
            leases.map((lease, i) => (
              <LeaseRow key={lease.id} lease={lease} setActiveTab={setActiveTab} ref={leaseRefs[i]} deploymentManifest={deploymentManifest} dseq={dseq} />
            ))}

          {!hasLeases && !isLoadingLeases && !isLoadingDeployment && <>This deployment doesn't have any leases</>}

          {(isLoadingLeases || isLoadingDeployment) && !hasLeases && (
            <Box textAlign="center" padding="2rem">
              <CircularProgress />
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}
