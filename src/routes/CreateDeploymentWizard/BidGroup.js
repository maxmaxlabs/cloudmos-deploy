import { makeStyles, ListSubheader, Radio, List, ListItemText, ListItemIcon, ListItem, Box, Typography, Chip } from "@material-ui/core";
import { Address } from "../../shared/components/Address";
import { PriceValue } from "../../shared/components/PriceValue";
import { uaktToAKT, averageBlockTime } from "../../shared/utils/priceUtils";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";
import { averageDaysInMonth } from "../../shared/utils/date";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  subHeader: {
    lineHeight: "1.5rem"
  },
  secondaryText: {
    fontSize: ".8rem"
  },
  attributesContainer: {
    flexBasis: "45%",
    margin: "2px 0",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: ".5rem",
    padding: ".5rem"
  },
  attributeTitle: {
    marginBottom: "2px"
  },
  attributeRow: {
    display: "flex",
    alignItems: "center",
    lineHeight: "1rem"
  },
  attributeText: {
    lineHeight: "1rem",
    letterSpacing: 0
  },
  chip: {
    height: "16px"
  }
}));

export function BidGroup({ bids, gseq, selectedBid, handleBidSelected, disabled, providers, filteredBids }) {
  const classes = useStyles();

  return (
    <List
      className={classes.root}
      subheader={
        <ListSubheader component="div" className={classes.subHeader}>
          GSEQ: {gseq}
        </ListSubheader>
      }
    >
      {bids
        .filter((bid) => filteredBids.includes(bid.id))
        .map((bid) => {
          const provider = providers && providers.find((x) => x.owner === bid.provider);
          return (
            <ListItem disabled={bid.state !== "open" || disabled} key={bid.id} dense button onClick={() => handleBidSelected(bid)}>
              <ListItemIcon>
                <Radio
                  checked={selectedBid?.id === bid.id}
                  //onChange={handleChange}
                  value={bid.id}
                  name="radio-button-demo"
                  disabled={disabled}
                />
              </ListItemIcon>
              <ListItemText
                id={`checkbox-list-label-${bid.id}`}
                classes={{ secondary: classes.secondaryText }}
                primary={
                  <>
                    <Box display="flex" alignItems="center" marginBottom="2px">
                      <Typography variant="body">
                        <strong>
                          ~<PriceValue value={uaktToAKT(bid.price.amount, 6) * (60 / averageBlockTime) * 60 * 24 * averageDaysInMonth} />
                        </strong>{" "}
                        per month
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Chip label={bid.state} size="small" color={bid.state === "open" ? "primary" : "seconday"} classes={{ root: classes.chip }} />
                      <Box component="span" marginLeft=".5rem">
                        {bid.price.amount} uakt / block
                      </Box>
                      <PriceEstimateTooltip value={uaktToAKT(bid.price.amount, 6)} />
                    </Box>
                  </>
                }
                secondary={<Address address={bid.provider} isCopyable />}
              />

              {provider && (
                <Box className={classes.attributesContainer}>
                  <Typography variant="body2" className={classes.attributeTitle}>
                    <strong>Attributes</strong>
                  </Typography>
                  {provider.attributes.map((a) => (
                    <Box className={classes.attributeRow} key={a.key}>
                      <Box>
                        <Typography variant="caption" className={classes.attributeText}>
                          {a.key}:
                        </Typography>
                      </Box>
                      <Box marginLeft="1rem">
                        <Typography variant="caption" className={classes.attributeText}>
                          {a.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </ListItem>
          );
        })}
    </List>
  );
}
