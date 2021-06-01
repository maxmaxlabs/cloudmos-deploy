import { useState, useEffect, useCallback } from "react";
import { apiEndpoint } from "../../shared/constants";
import { useParams, useHistory } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CloseIcon from "@material-ui/icons/Close";
import {
  Button,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@material-ui/core";
import { LeaseRow } from "./LeaseRow";
import { useStyles } from "./DeploymentDetail.styles";
import { DeploymentSubHeader } from "./DeploymentSubHeader";
import {
  acceptBid,
  deploymentGroupResourceSum,
} from "../../shared/utils/deploymentDetailUtils";
import {
  RAW_JSON_BIDS,
  RAW_JSON_DEPLOYMENT,
  RAW_JSON_LEASES,
} from "../../shared/constants";
import { syntaxHighlight } from "../../shared/utils/stringUtils";

export function DeploymentDetail(props) {
  const [bids, setBids] = useState([]);
  const [leases, setLeases] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [isLoadingLeases, setIsLoadingLeases] = useState(false);
  const [shownRawJson, setShownRawJson] = useState(null);

  const classes = useStyles();
  const history = useHistory();
  let { dseq } = useParams();

  const { address, selectedWallet } = props;
  const deployment = props.deployments.find((d) => d.dseq === dseq);

  const loadBids = useCallback(async () => {
    setIsLoadingBids(true);

    const response = await fetch(
      apiEndpoint +
        "/akash/market/v1beta1/bids/list?filters.owner=" +
        address +
        "&filters.dseq=" +
        deployment.dseq
    );
    const data = await response.json();

    console.log("bids", data);

    setBids(
      data.bids.map((b) => ({
        owner: b.bid.bid_id.owner,
        provider: b.bid.bid_id.provider,
        dseq: b.bid.bid_id.dseq,
        gseq: b.bid.bid_id.gseq,
        oseq: b.bid.bid_id.oseq,
        price: b.bid.price,
        state: b.bid.state,
      }))
    );

    setIsLoadingBids(false);
  }, [address, deployment]);

  const loadLeases = useCallback(async () => {
    setIsLoadingLeases(true);
    const response = await fetch(
      apiEndpoint +
        "/akash/market/v1beta1/leases/list?filters.owner=" +
        address +
        "&filters.dseq=" +
        deployment.dseq
    );
    const data = await response.json();

    console.log("leases", data);

    setLeases(
      data.leases.map((l) => {
        const group =
          deployment.groups.filter(
            (g) => g.group_id.gseq === l.lease.lease_id.gseq
          )[0] || {};

        return {
          id:
            l.lease.lease_id.dseq +
            l.lease.lease_id.gseq +
            l.lease.lease_id.oseq,
          owner: l.lease.lease_id.owner,
          provider: l.lease.lease_id.provider,
          dseq: l.lease.lease_id.dseq,
          gseq: l.lease.lease_id.gseq,
          oseq: l.lease.lease_id.oseq,
          state: l.lease.state,
          price: l.lease.price,
          cpuAmount: deploymentGroupResourceSum(
            group,
            (r) => parseInt(r.cpu.units.val) / 1000
          ),
          memoryAmount: deploymentGroupResourceSum(group, (r) =>
            parseInt(r.memory.quantity.val)
          ),
          storageAmount: deploymentGroupResourceSum(group, (r) =>
            parseInt(r.storage.quantity.val)
          ),
          group,
        };
      })
    );

    setIsLoadingLeases(false);
  }, [deployment, address]);

  const loadBlock = useCallback(async () => {
    // setIsLoadingLeases(true);
    const response = await fetch(`${apiEndpoint}/blocks/${deployment.dseq}`);
    const data = await response.json();

    setCurrentBlock(data);

    // setIsLoadingLeases(false);
  }, [deployment, address]);

  useEffect(() => {
    loadBids();
    loadLeases();
    loadBlock();
  }, [deployment, loadBids, loadLeases, loadBlock]);

  const onAcceptBid = async (bid) => {
    await acceptBid(bid, address, selectedWallet);

    loadBids();
    loadLeases();
  };

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
      case RAW_JSON_BIDS:
        value = bids;
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
      case RAW_JSON_BIDS:
        title = "Bids JSON";
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
            title: classes.cardTitle,
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
            <DeploymentSubHeader
              deployment={deployment}
              block={currentBlock}
              deploymentCost={
                leases && leases.length > 0
                  ? leases.reduce(
                      (prev, current) => prev + current.price.amount,
                      []
                    )
                  : 0
              }
              address={address}
              selectedWallet={selectedWallet}
              updateShownRawJson={(json) => setShownRawJson(json)}
            />
          }
        />

        <CardContent>
          {shownRawJson ? (
            <Box>
              <Box display="flex">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShownRawJson(null)}
                  startIcon={<CloseIcon />}
                >
                  Close
                </Button>

                <Typography variant="h6" className={classes.rawJsonTitle}>
                  {getRawJsonTitle(shownRawJson)}
                </Typography>
              </Box>

              <pre className={classes.rawJson}>
                <code
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(getRawJson(shownRawJson)),
                  }}
                ></code>
              </pre>
            </Box>
          ) : (
            <>
              {!isLoadingBids && bids.some((b) => b.state === "open") && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Bids
                  </Typography>
                  <List component="nav" dense>
                    {bids.map((bid) => (
                      <ListItem key={bid.provider}>
                        <ListItemText
                          primary={
                            <>
                              Price: {bid.price.amount}
                              {bid.price.denom}
                            </>
                          }
                          secondary={
                            <>
                              {bid.provider}
                              <br />
                              {bid.state}
                            </>
                          }
                        />
                        {bid.state === "open" && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => onAcceptBid(bid)}
                          >
                            Accept
                          </Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {!isLoadingLeases && (
                <>
                  <Typography
                    variant="h5"
                    gutterBottom
                    className={classes.title}
                  >
                    Leases
                  </Typography>
                  {leases.map((lease) => (
                    <LeaseRow
                      key={lease.id}
                      cert={props.cert}
                      lease={lease}
                      deployment={deployment}
                    />
                  ))}
                </>
              )}

              {(isLoadingLeases || isLoadingBids) && <CircularProgress />}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
