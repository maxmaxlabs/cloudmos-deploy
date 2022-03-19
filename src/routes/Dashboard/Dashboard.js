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
import { UrlService } from "../../shared/utils/urlUtils";
import { useBalances } from "../../queries/useBalancesQuery";
import { Balances } from "./Balances";
import { useProviders } from "../../queries";

const useStyles = makeStyles((theme) => ({
  titleContainer: {
    padding: "0 1rem 1rem",
    display: "flex",
    alignItems: "center"
  },
  title: {
    fontSize: "1.5rem",
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
  const { data: balances, isFetching: isLoadingBalances, refetch: getBalances } = useBalances(address, { enabled: false });
  const escrowSum = orderedDeployments.map((x) => x.escrowBalance).reduce((a, b) => a + b, 0);
  const { data: providers } = useProviders();

  useEffect(() => {
    getBalances();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      getBalances();
      refreshDeployments();
    } catch (error) {
      console.log(error);
    }

    setSelectedDeploymentDseqs([]);
  };

  return (
    <>
      <Helmet title="Dashboard" />
      <LinearLoadingSkeleton isLoading={isLoadingDeployments || isLoadingBalances} />
      <div>
        <Balances isLoadingBalances={isLoadingBalances} balances={balances} escrowSum={escrowSum} />

        <Box className={classes.titleContainer}>
          <Typography variant="h3" className={classes.title}>
            Active Deployments
          </Typography>

          <Box marginLeft="1rem">
            <IconButton aria-label="back" onClick={refreshDeployments} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>

          <Box marginLeft="1rem">
            <IconButton aria-label="Close" disabled={selectedDeploymentDseqs.length === 0} onClick={onCloseSelectedDeployments} size="small">
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

        <div>
          {orderedDeployments.length > 0 ? (
            orderedDeployments.map((deployment) => (
              <DeploymentListRow
                key={deployment.dseq}
                deployment={deployment}
                isSelectable
                onSelectDeployment={onSelectDeployment}
                checked={selectedDeploymentDseqs.some((x) => x === deployment.dseq)}
                providers={providers}
              />
            ))
          ) : (
            <Box textAlign="center" padding="4rem">
              {isLoadingDeployments ? (
                <Box paddingBottom="1rem">
                  <CircularProgress size="2rem" />
                </Box>
              ) : (
                <Typography variant="h5" className={classes.noActiveDeployments}>
                  No active deployments
                </Typography>
              )}

              <Button variant="contained" size="medium" color="primary" component={Link} to={UrlService.createDeployment()}>
                <AddIcon />
                &nbsp;Create Deployment
              </Button>
            </Box>
          )}
        </div>
      </div>
    </>
  );
}
