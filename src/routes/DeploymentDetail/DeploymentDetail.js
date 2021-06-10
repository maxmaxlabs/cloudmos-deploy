import { useState, useEffect, useCallback } from "react";
import { apiEndpoint } from "../../shared/constants";
import { useParams, useHistory } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { CircularProgress, IconButton, Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { LeaseRow } from "./LeaseRow";
import { useStyles } from "./DeploymentDetail.styles";
import { DeploymentSubHeader } from "./DeploymentSubHeader";
import { deploymentGroupResourceSum } from "../../shared/utils/deploymentDetailUtils";
import { useWallet } from "../../context/WalletProvider";
import { deploymentToDto } from "../../shared/utils/deploymentDetailUtils";
import { DeploymentJsonViewer } from "./DeploymentJsonViewer";
import { ManifestEditor } from "./ManifestEditor";

export function DeploymentDetail(props) {
  const [leases, setLeases] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [isLoadingLeases, setIsLoadingLeases] = useState(false);
  const [shownRawJson, setShownRawJson] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [isLoadingDeployment, setIsLoadingDeployment] = useState(false);
  const [isShowingManifestEditor, setIsShowingManifestEditor] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const { address } = useWallet();
  let { dseq } = useParams();

  const loadLeases = useCallback(async () => {
    setIsLoadingLeases(true);
    const response = await fetch(apiEndpoint + "/akash/market/v1beta1/leases/list?filters.owner=" + address + "&filters.dseq=" + deployment.dseq);
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

    if (leases.length === 0) {
      history.push("/createDeployment/acceptBids/" + dseq);
    }
  }, [deployment, address]);

  const loadBlock = useCallback(async () => {
    // setIsLoadingLeases(true);
    const response = await fetch(`${apiEndpoint}/blocks/${deployment.createdAt}`);
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
        const response = await fetch(apiEndpoint + "/akash/deployment/v1beta1/deployments/info?id.owner=" + address + "&id.dseq=" + dseq);
        const deployment = await response.json();
        
        setDeployment(deploymentToDto(deployment));
        setIsLoadingDeployment(false);
      }
    })();
  }, []);

  function handleBackClick() {
    history.push("/");
  }

  function handleOpenRawJson(json) {
    setShownRawJson(json);
    setIsShowingManifestEditor(false);
  }

  function handleOpenManifestEditor() {
    setShownRawJson(null);
    setIsShowingManifestEditor(true);
  }

  return (
    <>
      <Card className={classes.root} variant="outlined">
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
                updateShownRawJson={(json) => handleOpenRawJson(json)}
                openManifestEditor={handleOpenManifestEditor}
              />
            )
          }
        />

        <CardContent>
          {isShowingManifestEditor && deployment && leases ? (
            <ManifestEditor deployment={deployment} leases={leases} closeManifestEditor={() => setIsShowingManifestEditor(false)} />
          ) : shownRawJson ? (
            <DeploymentJsonViewer deployment={deployment} leases={leases} setShownRawJson={setShownRawJson} shownRawJson={shownRawJson} />
          ) : (
            <>
              {!isLoadingLeases && (
                <>
                  <Typography variant="h5" gutterBottom className={classes.title}>
                    Leases
                  </Typography>
                  {leases.map((lease) => (
                    <LeaseRow key={lease.id} cert={props.cert} lease={lease} deployment={deployment} />
                  ))}
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
