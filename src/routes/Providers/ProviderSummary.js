import { useState } from "react";
import { makeStyles, Box } from "@material-ui/core";
import { Address } from "../../shared/components/Address";
import { LinkTo } from "../../shared/components/LinkTo";
import clsx from "clsx";
import { ResourceBars } from "../../shared/components/ResourceBars";
import { LoadProviderDetail } from "./LoadProviderDetail";
import { FavoriteButton } from "../../shared/components/FavoriteButton";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { AuditorButton } from "./AuditorButton";

const useStyles = makeStyles((theme) => ({
  dataRow: {
    lineHeight: "1rem",
    marginBottom: ".5rem"
  },
  summaryRow: {
    display: "flex",
    marginBottom: ".3rem"
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  summaryLabelValues: {
    display: "flex",
    flexGrow: 1
  },
  summaryLabels: {
    flexBasis: "150px",
    fontWeight: "bold"
  },
  summaryValues: {
    flexBasis: "75%"
  }
}));

export function ProviderSummary({ provider, leases }) {
  const classes = useStyles();
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const { favoriteProviders, updateFavoriteProviders } = useLocalNotes();
  const isFavorite = favoriteProviders.some((x) => provider.owner === x);
  const numberOfDeployments = leases?.filter((d) => d.provider === provider.owner).length || 0;
  const numberOfActiveLeases = leases?.filter((d) => d.provider === provider.owner && d.state === "active").length || 0;

  const onStarClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const newFavorites = isFavorite ? favoriteProviders.filter((x) => x !== provider.owner) : favoriteProviders.concat([provider.owner]);

    updateFavoriteProviders(newFavorites);
  };

  const onViewDetailsClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsViewingDetail(true);
  };

  const onCloseClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsViewingDetail(false);
  };

  return (
    <>
      <div className={classes.summaryRow}>
        <div className={classes.summaryLabelValues}>
          <div className={classes.summaryLabels}>
            <div className={classes.dataRow}>Owner</div>
            <div className={classes.dataRow}>Uri</div>
            {provider.isActive && <div className={classes.dataRow}>Active leases</div>}
            <div className={classes.dataRow}>Your leases</div>
            <div className={classes.dataRow}>Active leases</div>
          </div>
          <div className={clsx("text-truncate", classes.summaryValues)}>
            <div className={classes.dataRow}>
              <Address address={provider.owner} isCopyable />
            </div>
            <div className={clsx("text-truncate", classes.dataRow)}>{provider.host_uri}</div>
            {provider.isActive && <div className={classes.dataRow}>{provider.leaseCount}</div>}
            <div className={classes.dataRow}>{numberOfDeployments}</div>
            <div className={classes.dataRow}>{numberOfActiveLeases}</div>
          </div>
        </div>
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
      </div>

      <div className={classes.buttonRow}>
        <Box display="flex" alignItems="center">
          <FavoriteButton isFavorite={isFavorite} onClick={onStarClick} />

          {provider.isAudited && (
            <Box marginLeft=".5rem">
              <AuditorButton provider={provider} />
            </Box>
          )}
        </Box>

        <div>
          <LinkTo onClick={onViewDetailsClick}>View details</LinkTo>
        </div>
      </div>

      {isViewingDetail && <LoadProviderDetail provider={provider} address={provider.owner} onClose={onCloseClick} />}
    </>
  );
}
