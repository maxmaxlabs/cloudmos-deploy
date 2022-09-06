import { useState } from "react";
import { makeStyles, Box, Paper } from "@material-ui/core";
import { Address } from "../../shared/components/Address";
import { LinkTo } from "../../shared/components/LinkTo";
import clsx from "clsx";
import { ResourceBars } from "../../shared/components/ResourceBars";
import { LoadProviderDetail } from "./LoadProviderDetail";
import { FavoriteButton } from "../../shared/components/FavoriteButton";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { AuditorButton } from "./AuditorButton";
import { StatusPill } from "../../shared/components/StatusPill";
import { UrlService } from "../../shared/utils/urlUtils";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    padding: ".5rem",
    borderRadius: ".3rem"
  },
  rootClickable: {
    cursor: "pointer",
    transition: "background-color .2s ease",
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    }
  },
  dataRow: {
    lineHeight: "1rem",
    marginBottom: ".5rem",
    display: "flex",
    alignItems: "center"
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

export function ProviderSummary({ provider, leases, canViewDetail = false }) {
  const classes = useStyles();
  const history = useHistory();
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const { favoriteProviders, updateFavoriteProviders } = useLocalNotes();
  const isFavorite = favoriteProviders.some((x) => provider.owner === x);

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

  const cardClick = () => {
    if (canViewDetail) {
      history.push(UrlService.providerDetail(provider.owner));
    }
  };

  return (
    <>
      <Paper elevation={1} className={clsx(classes.root, { [classes.rootClickable]: canViewDetail })} onClick={cardClick}>
        <div className={classes.summaryRow}>
          <div className={classes.summaryLabelValues}>
            <div className={classes.summaryLabels}>
              <div className={classes.dataRow}>Owner</div>
              <div className={classes.dataRow}>Uri</div>
              {provider.isActive && <div className={classes.dataRow}>Active leases</div>}
              <div className={classes.dataRow}>Your leases</div>
              <div className={classes.dataRow}>Your Active leases</div>
            </div>
            <div className={clsx("text-truncate", classes.summaryValues)}>
              <div className={classes.dataRow}>
                <Address address={provider.owner} isCopyable />
              </div>
              <div className={clsx("text-truncate", classes.dataRow)}>{provider.host_uri}</div>
              {provider.isActive && <div className={classes.dataRow}>{provider.leaseCount}</div>}
              <div className={classes.dataRow}>{provider.userLeases}</div>
              <div className={classes.dataRow}>
                {provider.userActiveLeases} {provider.userActiveLeases > 0 && <StatusPill state="active" size="small" />}
              </div>
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
      </Paper>

      {isViewingDetail && <LoadProviderDetail provider={provider} address={provider.owner} onClose={onCloseClick} />}
    </>
  );
}
