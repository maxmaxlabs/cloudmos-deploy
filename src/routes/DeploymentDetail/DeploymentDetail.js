import { useState, useEffect, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { CircularProgress, Tabs, Tab, IconButton, Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { LeaseRow } from "./LeaseRow";
import { useStyles } from "./DeploymentDetail.styles";
import { DeploymentSubHeader } from "./DeploymentSubHeader";
import { deploymentGroupResourceSum } from "../../shared/utils/deploymentDetailUtils";
import { useWallet } from "../../context/WalletProvider";
import { deploymentToDto } from "../../shared/utils/deploymentDetailUtils";
import { DeploymentJsonViewer } from "./DeploymentJsonViewer";
import { ManifestEditor } from "./ManifestEditor";
import { UrlService } from "../../shared/utils/urlUtils";
import { useSettings } from "../../context/SettingsProvider";

export function DeploymentDetail(props) {
  const { settings } = useSettings();
  const [leases, setLeases] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [isLoadingLeases, setIsLoadingLeases] = useState(false);
  const [deployment, setDeployment] = useState(null);
  const [isLoadingDeployment, setIsLoadingDeployment] = useState(false);
  const [activeTab, setActiveTab] = useState("DETAILS");
  const classes = useStyles();
  const history = useHistory();
  const { address } = useWallet();
  let { dseq } = useParams();

  const loadLeases = useCallback(async () => {
    setIsLoadingLeases(true);
    const response = await fetch(settings.apiEndpoint + "/akash/market/v1beta1/leases/list?filters.owner=" + address + "&filters.dseq=" + deployment.dseq);
    const data = await response.json();

    console.log("leases", data);

    const leases = data.leases.map((l) => {
      const group = deployment.groups.filter((g) => g.group_id.gseq === l.lease.lease_id.gseq)[0] || {};

      return {
        id: l.lease.lease_id.dseq + l.lease.lease_id.gseq + l.lease.lease_id.oseq,
        owner: l.lease.lease_id.owner,
        provider: l.lease.lease_id.provider,
        dseq: l.lease.lease_id.dseq,
        gseq: l.lease.lease_id.gseq,
        oseq: l.lease.lease_id.oseq,
        state: l.lease.state,
        price: l.lease.price,
        cpuAmount: deploymentGroupResourceSum(group, (r) => parseInt(r.cpu.units.val) / 1000),
        memoryAmount: deploymentGroupResourceSum(group, (r) => parseInt(r.memory.quantity.val)),
        storageAmount: deploymentGroupResourceSum(group, (r) => parseInt(r.storage.quantity.val)),
        group
      };
    });

    setLeases(leases);
    setIsLoadingLeases(false);

    if (deployment.state === "active" && leases.length === 0) {
      history.push("/createDeployment/acceptBids/" + dseq);
    }
  }, [deployment, address]);

  const loadBlock = useCallback(async () => {
    // setIsLoadingLeases(true);
    const response = await fetch(`${settings.apiEndpoint}/blocks/${deployment.createdAt}`);
    const data = await response.json();

    setCurrentBlock(data);

    // setIsLoadingLeases(false);
  }, [deployment]);

  useEffect(() => {
    if (deployment) {
      loadLeases();
      loadBlock();
    }
  }, [deployment, loadLeases, loadBlock]);

  useEffect(() => {
    (async function () {
      let deploymentFromList = props.deployments.find((d) => d.dseq === dseq);
      if (deploymentFromList) {
        setDeployment(deploymentFromList);
      } else {
        setIsLoadingDeployment(true);
        const response = await fetch(settings.apiEndpoint + "/akash/deployment/v1beta1/deployments/info?id.owner=" + address + "&id.dseq=" + dseq);
        const deployment = await response.json();

        setDeployment(deploymentToDto(deployment));
        setIsLoadingDeployment(false);
      }
    })();
  }, []);

  function handleBackClick() {
    history.push(UrlService.deploymentList());
  }

  return (
    <>
      <Card className={classes.root}>
        <CardHeader
          classes={{
            title: classes.cardTitle
          }}
          title={
            <>
              <IconButton aria-label="back" onClick={handleBackClick}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h4" className={classes.title}>
                Deployment detail
              </Typography>
            </>
          }
          subheader={
            deployment && (
              <DeploymentSubHeader
                deployment={deployment}
                block={currentBlock}
                deploymentCost={leases && leases.length > 0 ? leases.reduce((prev, current) => prev + current.price.amount, []) : 0}
                address={address}
              />
            )
          }
        />

        <Tabs value={activeTab} onChange={(ev, value) => setActiveTab(value)} indicatorColor="primary" textColor="primary" centered>
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
              {!isLoadingLeases && (
                <>
                  <Typography variant="h6" gutterBottom className={classes.title}>
                    Leases
                  </Typography>
                  {leases.map((lease) => (
                    <LeaseRow key={lease.id} cert={props.cert} lease={lease} deployment={deployment} />
                  ))}
                  {leases.length === 0 && <>This deployment doesn't have any leases</>}
                </>
              )}

              {(isLoadingLeases || isLoadingDeployment) && <CircularProgress />}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
