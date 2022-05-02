import { useState } from "react";
import { makeStyles, Box, Grid, Paper, IconButton } from "@material-ui/core";
import { useHistory } from "react-router";
import { Address } from "../../shared/components/Address";
import { ProviderDetail } from "../../components/ProviderDetail/ProviderDetail";
import { LinkTo } from "../../shared/components/LinkTo";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import StarIcon from "@material-ui/icons/Star";
import clsx from "clsx";
import { ResourceBars } from "../../shared/components/ResourceBars";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    padding: ".5rem",
    borderRadius: ".3rem"
  },
  dataRow: {
    lineHeight: "1rem",
    marginBottom: ".5rem"
  }
}));

export function ProviderCard({ provider }) {
  const classes = useStyles();
  const history = useHistory();
  const [isViewingDetail, setIsViewingDetail] = useState(false);

  const onStarClick = () => {};

  return (
    <Grid item xs={12}>
      <Paper elevation={2} className={classes.root}>
        <Box display="flex" marginBottom=".3rem">
          <Box display="flex" flexGrow={1}>
            <Box flexBasis="100px" fontWeight="bold">
              <div className={classes.dataRow}>Owner</div>
              <div className={classes.dataRow}>Uri</div>
              {provider.isActive && <div className={classes.dataRow}>Active leases</div>}
            </Box>
            <Box flexBasis="75%" className="text-truncate">
              <div className={classes.dataRow}>
                <Address address={provider.owner} isCopyable />
              </div>
              <div className={clsx("text-truncate", classes.dataRow)}>{provider.host_uri}</div>
              {provider.isActive && <div className={clsx("text-truncate", classes.dataRow)}>{provider.leaseCount}</div>}
            </Box>
          </Box>
          {provider.isActive && (
            <Box flexBasis="50%">
              <ResourceBars
                activeCPU={provider.activeStats.cpu / 1000}
                activeMemory={provider.activeStats.memory}
                activeStorage={provider.activeStats.storage}
                pendingCPU={provider.pendingStats.cpu / 1000}
                pendingMemory={provider.pendingStats.memory}
                pendingStorage={provider.pendingStats.storage}
                totalCPU={(provider.availableStats.cpu + provider.pendingStats.cpu + provider.activeStats.cpu) / 1000}
                totalMemory={provider.availableStats.memory + provider.pendingStats.memory + provider.activeStats.memory}
                totalStorage={provider.availableStats.storage + provider.pendingStats.storage + provider.activeStats.storage}
              />
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <IconButton onClick={onStarClick} size="small">
              <StarBorderIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box>
            <LinkTo onClick={() => setIsViewingDetail(true)}>View details</LinkTo>
          </Box>
        </Box>

        {/* {isViewingDetail && providerStatus && <ProviderDetail provider={providerStatus} address={bid.provider} onClose={() => setIsViewingDetail(false)} />} */}
      </Paper>
    </Grid>
  );
}
