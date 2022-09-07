import { makeStyles, Radio, ListItemText, ListItemIcon, ListItem, Box, Chip, CircularProgress, Typography } from "@material-ui/core";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";
import { PricePerMonth } from "../../shared/components/PricePerMonth";
import { ProviderAttributes } from "../../shared/components/ProviderAttributes";
import { useEffect, useState } from "react";
import { useProviderStatus } from "../../queries";
import CloudOffIcon from "@material-ui/icons/CloudOff";
import clsx from "clsx";
import { LinkTo } from "../../shared/components/LinkTo";
import { FormattedNumber } from "react-intl";
import { ProviderDetailModal } from "../../components/ProviderDetail";
import { FavoriteButton } from "../../shared/components/FavoriteButton";
import { useLocalNotes } from "../../context/LocalNoteProvider";
import { AuditorButton } from "../Providers/AuditorButton";

const useStyles = makeStyles((theme) => ({
  root: {},
  secondaryText: {
    fontSize: ".8rem"
  },
  chip: {
    height: ".9rem",
    fontSize: ".7rem",
    lineHeight: ".7rem"
  },
  priceTooltip: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.grey[600]
  },
  pricePerMonth: {
    fontSize: "1.15rem"
  },
  bidState: {
    marginBottom: "4px"
  },
  providerOffline: {
    marginTop: "4px"
  },
  stateIcon: {
    marginRight: ".5rem"
  },
  stateActive: {
    color: theme.palette.primary.main
  },
  stateInactive: {
    color: theme.palette.secondary.main
  },
  flexCenter: {
    display: "flex",
    alignItems: "center"
  }
}));

export function BidRow({ bid, selectedBid, handleBidSelected, disabled, provider }) {
  const classes = useStyles();
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const { favoriteProviders, updateFavoriteProviders } = useLocalNotes();
  const isFavorite = favoriteProviders.some((x) => provider.owner === x);
  const {
    data: providerStatus,
    isLoading: isLoadingStatus,
    refetch: fetchProviderStatus,
    error
  } = useProviderStatus(provider?.host_uri, {
    enabled: false,
    retry: false
  });

  const onStarClick = () => {
    const newFavorites = isFavorite ? favoriteProviders.filter((x) => x !== provider.owner) : favoriteProviders.concat([provider.owner]);

    updateFavoriteProviders(newFavorites);
  };

  useEffect(() => {
    if (provider) {
      fetchProviderStatus();
    }
  }, [provider, fetchProviderStatus]);

  return (
    <ListItem disabled={bid.state !== "open" || disabled} dense>
      <ListItemIcon>
        <Radio
          checked={selectedBid?.id === bid.id}
          onChange={() => handleBidSelected(bid)}
          value={bid.id}
          name="radio-button-demo"
          disabled={bid.state !== "open" || disabled}
          size="medium"
        />
      </ListItemIcon>

      <ListItemText
        id={`checkbox-list-label-${bid.id}`}
        classes={{ secondary: classes.secondaryText }}
        primaryTypographyProps={{
          component: "div"
        }}
        secondaryTypographyProps={{
          component: "div"
        }}
        primary={
          <>
            <PricePerMonth perBlockValue={uaktToAKT(bid.price.amount, 6)} className={classes.pricePerMonth} />

            <div className={clsx(classes.flexCenter, classes.bidState)}>
              <Chip
                label={bid.state}
                size="small"
                color={bid.state === "open" ? "primary" : bid.state === "active" ? "primary" : "secondary"}
                classes={{ root: classes.chip }}
              />
              <Box component="span" marginLeft=".5rem" fontSize=".75rem">
                <FormattedNumber value={bid.price.amount} maximumFractionDigits={18} /> uakt / block
              </Box>
              <Box className={classes.priceTooltip}>
                <PriceEstimateTooltip value={uaktToAKT(bid.price.amount, 6)} />
              </Box>
            </div>
          </>
        }
        secondary={
          <div>
            {isLoadingStatus && <CircularProgress size="1rem" />}

            {providerStatus && (
              <Typography variant="body2" color="textSecondary">
                {providerStatus?.name}
              </Typography>
            )}

            {error && (
              <div className={clsx(classes.flexCenter, classes.providerOffline)}>
                <CloudOffIcon className={clsx(classes.stateIcon, classes.stateInactive)} fontSize="small" />
                <strong>OFFLINE</strong>
              </div>
            )}

            {providerStatus && (
              <div className={classes.flexCenter}>
                <FavoriteButton isFavorite={isFavorite} onClick={onStarClick} />

                {provider.isAudited && (
                  <Box marginLeft=".5rem">
                    <AuditorButton provider={provider} />
                  </Box>
                )}

                <Box marginLeft=".5rem" display="flex">
                  <LinkTo onClick={() => setIsViewingDetail(true)}>View details</LinkTo>
                </Box>
              </div>
            )}
          </div>
        }
      />

      {provider && <ProviderAttributes provider={provider} />}
      {isViewingDetail && provider && providerStatus && (
        <ProviderDetailModal provider={{ ...provider, ...providerStatus }} address={bid.provider} onClose={() => setIsViewingDetail(false)} />
      )}
    </ListItem>
  );
}
