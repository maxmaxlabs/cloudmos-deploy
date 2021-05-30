import { useState, useEffect } from "react";
import { apiEndpoint, rpcEndpoint } from "./shared/constants";
import { NewDeploymentData } from "./shared/utils/deploymentUtils";
import { MsgCreateDeployment } from "./ProtoAkashTypes";
import { SigningStargateClient } from "@cosmjs/stargate";
import { customRegistry, baseFee } from "./shared/utils/blockchainUtils";
import DemoDeployYaml from "./demo.deploy.yml";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import CloudIcon from "@material-ui/icons/Cloud";
import AddIcon from "@material-ui/icons/Add";
import MemoryIcon from "@material-ui/icons/Memory";
import StorageIcon from "@material-ui/icons/Storage";
import SpeedIcon from "@material-ui/icons/Speed";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import {
  makeStyles,
  Button,
  CircularProgress,
  IconButton,
  Box,
  Card,
  CardHeader,
  CardContent,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { useHistory } from "react-router";

const yaml = require("js-yaml");

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "5px 10px",
    "& .MuiListItemText-secondary .MuiSvgIcon-root:not(:first-child)": {
      marginLeft: "5px",
    },
    "& .MuiListItemText-secondary .MuiSvgIcon-root": {
      fontSize: "20px",
    },
  },
}));

function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

export function DeploymentList(props) {
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(false);

  const classes = useStyles();
  const history = useHistory();

  const { address, selectedWallet, deployments, setDeployments } = props;

  useEffect(() => {
    loadDeployments(address);
  }, [address]);

  async function loadDeployments(address) {
    setIsLoadingDeployments(true);
    const response = await fetch(
      apiEndpoint +
        "/akash/deployment/v1beta1/deployments/list?filters.owner=" +
        address
    );
    const deployments = await response.json();

    function deploymentResourceSum(deployment, resourceSelector) {
      return deployment.groups
        .map((g) =>
          g.group_spec.resources
            .map((r) => r.count * resourceSelector(r.resources))
            .reduce((a, b) => a + b)
        )
        .reduce((a, b) => a + b);
    }

    setDeployments(
      deployments.deployments.map((d) => ({
        dseq: d.deployment.deployment_id.dseq,
        state: d.deployment.state,
        createdAt: parseInt(d.deployment.created_at),
        escrowBalance: d.escrow_account.balance,
        transferred: d.escrow_account.transferred,
        cpuAmount: deploymentResourceSum(
          d,
          (r) => parseInt(r.cpu.units.val) / 1000
        ),
        memoryAmount: deploymentResourceSum(d, (r) =>
          parseInt(r.memory.quantity.val)
        ),
        storageAmount: deploymentResourceSum(d, (r) =>
          parseInt(r.storage.quantity.val)
        ),
        escrowAccount: { ...d.escrow_account },
      }))
    );

    setIsLoadingDeployments(false);
  }

  async function createDeployment() {
    console.log("not today..");
    return;

    history.push("/createDeployment");

    const flags = {};
    const response = await fetch(DemoDeployYaml);
    const txt = await response.text();
    const doc = yaml.load(txt);

    const dd = await NewDeploymentData(doc, flags, address); // TODO Flags

    const msg = {
      id: dd.deploymentId,
      groups: dd.groups,
      version: dd.version,
      deposit: dd.deposit,
    };

    const txData = {
      typeUrl: "/akash.deployment.v1beta1.MsgCreateDeployment",
      value: msg,
    };

    const err = MsgCreateDeployment.verify(msg);
    // const encoded = MsgCreateDeployment.fromObject(msg);
    // const decoded = MsgCreateDeployment.toObject(encoded);

    if (err) throw err;

    const client = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      selectedWallet,
      {
        registry: customRegistry,
      }
    );

    await client.signAndBroadcast(address, [txData], baseFee);

    loadDeployments(address);
  }

  async function viewDeployment(deployment) {
    history.push("/deployment/" + deployment.dseq);
  }

  const orderedDeployments = [...deployments].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );

  return (
    <>
      <Card className={classes.root} variant="outlined">
        <CardHeader title="Deployments" />
        <CardContent>
          {orderedDeployments.map((deployment) => (
            <ListItem
              key={deployment.dseq}
              button
              onClick={() => viewDeployment(deployment)}
            >
              <ListItemIcon>
                {deployment.state === "active" && <CloudIcon />}
                {deployment.state === "closed" && <CancelPresentationIcon />}
              </ListItemIcon>
              <ListItemText
                primary={deployment.dseq}
                secondary={
                  <Box component="span" display="flex" alignItems="center">
                    <SpeedIcon />
                    {deployment.cpuAmount + "vcpu"}
                    <MemoryIcon title="Memory" />
                    {humanFileSize(deployment.memoryAmount)}
                    <StorageIcon />
                    {humanFileSize(deployment.storageAmount)}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => viewDeployment(deployment)}
                >
                  <ChevronRightIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}

          {isLoadingDeployments && <CircularProgress />}

          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={() => createDeployment()}
          >
            <AddIcon />
            &nbsp;Create Deployment
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
