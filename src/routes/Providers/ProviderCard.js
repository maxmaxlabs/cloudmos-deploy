import { useState } from "react";
import { makeStyles, Box, Grid, Paper } from "@material-ui/core";
import { Address } from "../../shared/components/Address";
import { LinkTo } from "../../shared/components/LinkTo";
import clsx from "clsx";
import { ResourceBars } from "../../shared/components/ResourceBars";
import { updateProviderLocalData } from "../../shared/utils/providerUtils";
import { LoadProviderDetail } from "./LoadProviderDetail";
import { FavoriteButton } from "../../shared/components/FavoriteButton";

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

export function ProviderCard({ provider, favoriteProviders, setFavoriteProviders }) {
  const classes = useStyles();
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const isFavorite = favoriteProviders.some((x) => provider.owner === x);

  const onStarClick = () => {
    const newFavorites = isFavorite ? favoriteProviders.filter((x) => x !== provider.owner) : favoriteProviders.concat([provider.owner]);

    updateProviderLocalData({ favorites: newFavorites });
    setFavoriteProviders(newFavorites);
  };

  return (
    <Grid item xs={12}>
      <Paper elevation={1} className={classes.root}>
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
            <FavoriteButton isFavorite={isFavorite} onClick={onStarClick} />
          </Box>

          <Box>
            <LinkTo onClick={() => setIsViewingDetail(true)}>View details</LinkTo>
          </Box>
        </Box>

        {isViewingDetail && <LoadProviderDetail provider={provider} address={provider.owner} onClose={() => setIsViewingDetail(false)} />}
      </Paper>
    </Grid>
  );
}
