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
import { DashboardInfoPanel } from "./DashboardInfoPanel";
import { useProviders, useBalances, useNetworkCapacity } from "../../queries";
import { LinkTo } from "../../shared/components/LinkTo";
import { useLocalNotes } from "../../context/LocalNoteProvider";

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
  const { getDeploymentName } = useLocalNotes();
  const orderedDeployments = deployments
    ? [...deployments]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .filter((d) => d.state === "active")
        .map((d) => {
          const name = getDeploymentName(d.dseq);

          return {
            ...d,
            name
          };
        })
    : [];
  const [selectedDeploymentDseqs, setSelectedDeploymentDseqs] = useState([]);
  const { address } = useWallet();
  const { sendTransaction } = useTransactionModal();
  const { settings } = useSettings();
  const { apiEndpoint } = settings;
  const { data: balances, isFetching: isLoadingBalances, refetch: getBalances } = useBalances(address, { enabled: false });
  const { data: networkCapacity, isFetching: isLoadingNetworkCapacity, refetch: getNetworkCapacity } = useNetworkCapacity({ enabled: false });
  const escrowSum = orderedDeployments.map((x) => x.escrowBalance).reduce((a, b) => a + b, 0);
  const { data: providers } = useProviders();

  useEffect(() => {
    getBalances();
    getNetworkCapacity();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    refreshDeployments();
  }, [refreshDeployments, apiEndpoint, address]);

  const onSelectDeployment = (checked, dseq) => {
    setSelectedDeploymentDseqs((prev) => {
      return checked ? prev.concat([dseq]) : prev.filter((x) => x !== dseq);
    });
  };

  const onCloseSelectedDeployments = async () => {
    try {
      const messages = selectedDeploymentDseqs.map((dseq) => TransactionMessageData.getCloseDeploymentMsg(address, dseq));
      const response = await sendTransaction(messages);

      if (response) {
        getBalances();
        refreshDeployments();
        setSelectedDeploymentDseqs([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onClearSelection = () => {
    setSelectedDeploymentDseqs([]);
  };

  return (
    <>
      <Helmet title="Dashboard" />
      <LinearLoadingSkeleton isLoading={isLoadingDeployments || isLoadingBalances || isLoadingNetworkCapacity} />
      <div>
        <DashboardInfoPanel
          isLoadingBalances={isLoadingBalances}
          balances={balances}
          escrowSum={escrowSum}
          networkCapacity={networkCapacity}
          isLoadingNetworkCapacity={isLoadingNetworkCapacity}
        />

        <Box className={classes.titleContainer}>
          <Typography variant="h3" className={classes.title}>
            Active Deployments
          </Typography>

          <Box marginLeft="1rem">
            <IconButton onClick={refreshDeployments} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>

          <Box marginLeft="1rem">
            <IconButton disabled={selectedDeploymentDseqs.length === 0} onClick={onCloseSelectedDeployments} size="small">
              <CancelPresentationIcon />
            </IconButton>
          </Box>

          <Box marginLeft="1rem">
            {selectedDeploymentDseqs.length > 0 && (
              <LinkTo onClick={onClearSelection} size="small">
                Clear
              </LinkTo>
            )}
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
                refreshDeployments={refreshDeployments}
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
