import { makeStyles, ListSubheader, Radio, List, ListItemText, ListItemIcon, ListItem, Box, Typography, Chip, Paper } from "@material-ui/core";
import { Address } from "../../shared/components/Address";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";
import { PricePerMonth } from "../../shared/components/PricePerMonth";
import { useEffect, useState } from "react";
import { deploymentGroupResourceSum } from "../../shared/utils/deploymentDetailUtils";
import { SpecDetail } from "../../shared/components/SpecDetail";
import { LabelValue } from "../../shared/components/LabelValue";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: ".5rem 0",
    marginBottom: "1rem"
  },
  subHeader: {
    display: "flex",
    alignItems: "center",
    paddingBottom: "6px"
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
  },
  priceTooltip: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.grey[600]
  }
}));

export function BidGroup({ bids, gseq, selectedBid, handleBidSelected, disabled, providers, filteredBids, deploymentDetail }) {
  const classes = useStyles();
  const [resources, setResources] = useState();
  const allBidsClosed = bids.every((b) => b.state === "closed");

  useEffect(() => {
    const currentGroup = deploymentDetail?.groups.find((g) => g.group_id.gseq === Number(gseq));
    if (currentGroup) {
      const resourcesSum = {
        cpuAmount: deploymentGroupResourceSum(currentGroup, (r) => parseInt(r.cpu.units.val) / 1000),
        memoryAmount: deploymentGroupResourceSum(currentGroup, (r) => parseInt(r.memory.quantity.val)),
        storageAmount: deploymentGroupResourceSum(currentGroup, (r) => parseInt(r.storage.quantity.val))
      };
      setResources(resourcesSum);
    }
  }, [deploymentDetail, gseq]);

  return (
    <Paper elevation={4} className={classes.root}>
      <List
        subheader={
          <ListSubheader component="div" className={classes.subHeader}>
            <Typography variant="h6">
              <LabelValue label="GSEQ:" value={gseq} />
            </Typography>

            {resources && (
              <Box marginLeft={2}>
                <SpecDetail
                  cpuAmount={resources.cpuAmount}
                  memoryAmount={resources.memoryAmount}
                  storageAmount={resources.storageAmount}
                  color={allBidsClosed ? "default" : "primary"}
                  size="small"
                />
              </Box>
            )}
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
                      <Box marginBottom="2px" fontSize="1.1rem">
                        <PricePerMonth perBlockValue={uaktToAKT(bid.price.amount, 6)} />
                      </Box>

                      <Box display="flex" alignItems="center">
                        <Chip
                          label={bid.state}
                          size="small"
                          color={bid.state === "open" ? "default" : bid.state === "active" ? "primary" : "secondary"}
                          classes={{ root: classes.chip }}
                        />
                        <Box component="span" marginLeft=".5rem">
                          {bid.price.amount} uakt / block
                        </Box>
                        <Box className={classes.priceTooltip}>
                          <PriceEstimateTooltip value={uaktToAKT(bid.price.amount, 6)} />
                        </Box>
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
    </Paper>
  );
}
