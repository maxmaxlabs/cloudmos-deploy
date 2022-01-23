import AddIcon from "@material-ui/icons/Add";
import { makeStyles, IconButton, Box, Typography, Button, CircularProgress } from "@material-ui/core";
import { Link } from "react-router-dom";
import { LinearLoadingSkeleton } from "../../shared/components/LinearLoadingSkeleton";
import { Helmet } from "react-helmet-async";
import { DeploymentListRow } from "../DeploymentList/DeploymentListRow";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletProvider";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { useTransactionModal } from "../../context/TransactionModal";
import { useSettings } from "../../context/SettingsProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem",
    "& .MuiListItemText-secondary .MuiSvgIcon-root:not(:first-child)": {
      marginLeft: "5px"
    },
    "& .MuiListItemText-secondary .MuiSvgIcon-root": {
      fontSize: "20px"
    }
  },
  titleContainer: {
    paddingBottom: "1rem",
    display: "flex",
    alignItems: "center"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold"
  },
  noActiveDeployments: {
    marginBottom: "1rem"
  },
  createBtn: {
    marginLeft: "auto"
  }
}));

export function Dashboard({ deployments, isLoadingDeployments, refreshDeployments }) {
  const classes = useStyles();
  const orderedDeployments = deployments ? [...deployments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).filter((d) => d.state === "active") : [];
  const [selectedDeploymentDseqs, setSelectedDeploymentDseqs] = useState([]);
  const { address } = useWallet();
  const { sendTransaction } = useTransactionModal();
  const { settings } = useSettings();
  const { apiEndpoint } = settings;

  useEffect(() => {
    refreshDeployments();
  }, [refreshDeployments, apiEndpoint]);

  const onSelectDeployment = (checked, dseq) => {
    setSelectedDeploymentDseqs((prev) => {
      return checked ? prev.concat([dseq]) : prev.filter((x) => x !== dseq);
    });
  };

  const onCloseSelectedDeployments = async () => {
    try {
      const messages = selectedDeploymentDseqs.map((dseq) => TransactionMessageData.getCloseDeploymentMsg(address, dseq));
      await sendTransaction(messages);

      refreshDeployments();
    } catch (error) {
      console.log(error);
    }

    setSelectedDeploymentDseqs([]);
  };

  return (
    <>
      <Helmet title="Dashboard" />
      <LinearLoadingSkeleton isLoading={isLoadingDeployments} />
      <Box className={classes.root}>
        <Box className={classes.titleContainer}>
          <Typography variant="h3" className={classes.title}>
            Active Deployments
          </Typography>

          <Box marginLeft="1rem">
            <IconButton aria-label="back" onClick={refreshDeployments}>
              <RefreshIcon />
            </IconButton>
          </Box>

          <Box>
            <IconButton aria-label="Close" disabled={selectedDeploymentDseqs.length === 0} onClick={onCloseSelectedDeployments}>
              <CancelPresentationIcon />
            </IconButton>
          </Box>

          {orderedDeployments.length > 0 && (
            <Button className={classes.createBtn} variant="contained" size="medium" color="primary" component={Link} to="/createDeployment">
              <AddIcon />
              &nbsp;Create Deployment
            </Button>
          )}
        </Box>

        <Box>
          {orderedDeployments.length > 0 ? (
            orderedDeployments.map((deployment) => (
              <DeploymentListRow
                key={deployment.dseq}
                deployment={deployment}
                isSelectable
                onSelectDeployment={onSelectDeployment}
                checked={selectedDeploymentDseqs.some((x) => x === deployment.dseq)}
              />
            ))
          ) : (
            <Box textAlign="center" padding="4rem">
              {isLoadingDeployments ? (
                <Box paddingBottom="1rem">
                  <CircularProgress size="2.5rem" />
                </Box>
              ) : (
                <Typography variant="h5" className={classes.noActiveDeployments}>
                  No active deployments
                </Typography>
              )}

              <Button variant="contained" size="medium" color="primary" component={Link} to="/createDeployment">
                <AddIcon />
                &nbsp;Create Deployment
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
