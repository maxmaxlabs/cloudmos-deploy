import { makeStyles, Radio, ListItemText, ListItemIcon, ListItem, Box, Chip, CircularProgress } from "@material-ui/core";
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
import { ProviderDetail } from "../../components/ProviderDetail/ProviderDetail";
import { updateProviderLocalData } from "../../shared/utils/providerUtils";
import { FavoriteButton } from "../../shared/components/FavoriteButton";

const useStyles = makeStyles((theme) => ({
  root: {},
  secondaryText: {
    fontSize: ".8rem"
  },
  chip: {
    marginLeft: "4px",
    height: "16px"
  },
  priceTooltip: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.grey[600]
  },
  stateIcon: {
    marginLeft: ".5rem"
  },
  stateActive: {
    color: theme.palette.primary.main
  },
  stateInactive: {
    color: theme.palette.secondary.main
  }
}));

export function BidRow({ bid, selectedBid, handleBidSelected, disabled, provider, favoriteProviders, setFavoriteProviders }) {
  const classes = useStyles();
  const [isViewingDetail, setIsViewingDetail] = useState(false);
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

    updateProviderLocalData({ favorites: newFavorites });
    setFavoriteProviders(newFavorites);
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
            <Box marginBottom="2px" fontSize="1.1rem">
              <PricePerMonth perBlockValue={uaktToAKT(bid.price.amount, 6)} />
            </Box>

            <Box display="flex" alignItems="center">
              Bid:
              <Chip
                label={bid.state}
                size="small"
                color={bid.state === "open" ? "primary" : bid.state === "active" ? "primary" : "secondary"}
                classes={{ root: classes.chip }}
              />
              <Box component="span" marginLeft=".5rem">
                <FormattedNumber value={bid.price.amount} maximumFractionDigits={18} /> uakt / block
              </Box>
              <Box className={classes.priceTooltip}>
                <PriceEstimateTooltip value={uaktToAKT(bid.price.amount, 6)} />
              </Box>
            </Box>
          </>
        }
        secondary={
          <div>
            {isLoadingStatus && <CircularProgress size="1rem" />}

            {providerStatus && <div>Name: {providerStatus?.name}</div>}

            {error && (
              <Box display="flex" alignItems="center">
                <strong>OFFLINE</strong> <CloudOffIcon className={clsx(classes.stateIcon, classes.stateInactive)} fontSize="small" />
              </Box>
            )}

            {providerStatus && (
              <Box display="flex" alignItemx="center">
                <FavoriteButton isFavorite={isFavorite} onClick={onStarClick} />

                <Box marginLeft=".5rem" display="flex">
                  <LinkTo onClick={() => setIsViewingDetail(true)}>View details</LinkTo>
                </Box>
              </Box>
            )}
          </div>
        }
      />

      {provider && <ProviderAttributes provider={provider} />}
      {isViewingDetail && providerStatus && <ProviderDetail provider={providerStatus} address={bid.provider} onClose={() => setIsViewingDetail(false)} />}
    </ListItem>
  );
}
