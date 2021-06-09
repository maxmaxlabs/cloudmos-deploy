import { useState, useEffect, useCallback } from "react";
import { apiEndpoint } from "../../shared/constants";
import { useParams, useHistory } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CloseIcon from "@material-ui/icons/Close";
import { Button, CircularProgress, IconButton, Card, CardContent, CardHeader, Typography, Box } from "@material-ui/core";
import { LeaseRow } from "./LeaseRow";
import { useStyles } from "./DeploymentDetail.styles";
import { DeploymentSubHeader } from "./DeploymentSubHeader";
import { deploymentGroupResourceSum } from "../../shared/utils/deploymentDetailUtils";
import { RAW_JSON_DEPLOYMENT, RAW_JSON_LEASES } from "../../shared/constants";
import { syntaxHighlight } from "../../shared/utils/stringUtils";
import { useWallet } from "../../context/WalletProvider";
import { deploymentToDto } from "../../shared/utils/deploymentDetailUtils";

export function DeploymentDetail(props) {
  const [leases, setLeases] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [isLoadingLeases, setIsLoadingLeases] = useState(false);
  const [shownRawJson, setShownRawJson] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [isLoadingDeployment, setIsLoadingDeployment] = useState(false);
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
        console.log(deployment);
        setDeployment(deploymentToDto(deployment));
        setIsLoadingDeployment(false);
      }
    })();
  }, []);

  function handleBackClick() {
    history.push("/");
  }

  const getRawJson = (json) => {
    let value;

    switch (json) {
      case RAW_JSON_DEPLOYMENT:
        value = deployment;
        break;
      case RAW_JSON_LEASES:
        value = leases;
        break;

      default:
        break;
    }

    return JSON.stringify(value, null, 2);
  };

  const getRawJsonTitle = (json) => {
    let title = "";

    switch (json) {
      case RAW_JSON_DEPLOYMENT:
        title = "Deployment JSON";
        break;
      case RAW_JSON_LEASES:
        title = "Leases JSON";
        break;

      default:
        break;
    }

    return title;
  };

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
                updateShownRawJson={(json) => setShownRawJson(json)}
              />
            )
          }
        />

        <CardContent>
          {shownRawJson ? (
            <Box>
              <Box display="flex">
                <Button variant="contained" color="primary" onClick={() => setShownRawJson(null)} startIcon={<CloseIcon />}>
                  Close
                </Button>

                <Typography variant="h6" className={classes.rawJsonTitle}>
                  {getRawJsonTitle(shownRawJson)}
                </Typography>
              </Box>

              <pre className={classes.rawJson}>
                <code
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(getRawJson(shownRawJson))
                  }}
                ></code>
              </pre>
            </Box>
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
